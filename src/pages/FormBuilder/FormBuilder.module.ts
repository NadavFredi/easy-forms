import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetFormQuery,
  useUpdateFormMutation,
} from '@/store/api/formsApi';
import {
  useGetFieldsQuery,
  useCreateFieldMutation,
  useUpdateFieldMutation,
  useDeleteFieldMutation,
  useUpdateFieldsOrderMutation,
} from '@/store/api/fieldsApi';
import { FormField, FieldType } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export const useFormBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: form, isLoading: formLoading, error: formError } = useGetFormQuery(id || '', {
    skip: !id,
  });
  const { data: fields = [], isLoading: fieldsLoading } = useGetFieldsQuery(id || '', {
    skip: !id,
  });
  const [updateFormMutation] = useUpdateFormMutation();
  const [createFieldMutation] = useCreateFieldMutation();
  const [updateFieldMutation] = useUpdateFieldMutation();
  const [deleteFieldMutation] = useDeleteFieldMutation();
  const [updateFieldsOrderMutation] = useUpdateFieldsOrderMutation();

  // Check if user owns the form
  useEffect(() => {
    if (form && user && form.user_id !== user.id) {
      toast({
        title: 'גישה נדחתה',
        description: 'אין לך הרשאה לערוך את הטופס הזה',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  }, [form, user, navigate]);

  const createNewField = (type: FieldType = 'text'): FormField => {
    if (!id) throw new Error('Form ID is required');

    // Default to row 1 for new fields (one field per row)
    // The user can change this later with drag and drop
    const newRow = 1;
    const fieldsInRow = fields.filter(f => (f.row || 1) === newRow);
    const orderInRow = fieldsInRow.length;

    const newField: Partial<FormField> = {
      form_id: id,
      type,
      label: type === 'header' ? 'כותרת' : type === 'paragraph' ? 'פסקה' : 'שדה חדש',
      placeholder: '',
      required: false,
      order_index: orderInRow,
      row: newRow,
      width: 'full',
      options:
        type === 'select' || type === 'multiselect' || type === 'radio'
          ? { options: ['אפשרות 1', 'אפשרות 2'] }
          : type === 'link'
            ? { url: '' }
            : undefined,
    };

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    return { ...newField, id: tempId } as FormField;
  };

  const deleteFieldFromDB = async (fieldId: string) => {
    if (!id || !fieldId) return;

    try {
      await deleteFieldMutation({ id: fieldId, form_id: id }).unwrap();
      toast({
        title: 'הצלחה',
        description: 'השדה נמחק בהצלחה',
      });
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: error.message || 'נכשל במחיקת השדה',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDragEnd = async (event: DragEndEvent, localFields: FormField[]): Promise<FormField[] | null> => {
    if (!id) return null;

    const { active, over } = event;
    if (!over || active.id === over.id) return null;

    const oldIndex = localFields.findIndex((item) => item.id === active.id);
    const newIndex = localFields.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return null;

    const reorderedFields = arrayMove(localFields, oldIndex, newIndex).map((field, index) => ({
      ...field,
      order_index: index,
    }));

    // Update order in database for fields with real IDs
    const fieldsToUpdate = reorderedFields
      .filter((f) => f.id && !f.id.startsWith('temp-'))
      .map((f) => ({ id: f.id!, order_index: f.order_index }));

    if (fieldsToUpdate.length > 0) {
      try {
        await updateFieldsOrderMutation({
          formId: id,
          fields: fieldsToUpdate,
        }).unwrap();
      } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: 'נכשל בעדכון סדר השדות',
        variant: 'destructive',
      });
        return null;
      }
    }

    return reorderedFields;
  };

  const saveForm = async (formData: typeof form, localFields: FormField[]) => {
    if (!id || !formData) return;

    setSaving(true);
    try {
      // Update form
      await updateFormMutation({
        id,
        title: formData.title,
        description: formData.description,
        slug: formData.slug,
        is_published: formData.is_published,
      }).unwrap();

      // Get existing field IDs from database
      const existingFieldIds = fields.filter((f) => f.id && !f.id.startsWith('temp-')).map((f) => f.id!);
      const currentFieldIds = localFields
        .filter((f) => f.id && !f.id.startsWith('temp-'))
        .map((f) => f.id!);

      // Delete fields that were removed
      const fieldsToDelete = existingFieldIds.filter((id) => !currentFieldIds.includes(id));
      for (const fieldId of fieldsToDelete) {
        await deleteFieldMutation({ id: fieldId, form_id: id }).unwrap();
      }

      // Upsert fields
      for (const field of localFields) {
        if (field.id && !field.id.startsWith('temp-')) {
          // Update existing field
          await updateFieldMutation({
            id: field.id,
            type: field.type,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            options: field.options,
            validation: field.validation,
            order_index: field.order_index,
            width: field.width,
          }).unwrap();
        } else {
          // Create new field
          await createFieldMutation({
            form_id: id,
            type: field.type,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            options: field.options,
            validation: field.validation,
            order_index: field.order_index,
            width: field.width,
          }).unwrap();
        }
      }

      toast({
        title: 'הצלחה',
        description: 'הטופס נשמר בהצלחה!',
      });
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: error.message || 'נכשל בשמירת הטופס',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    fields,
    selectedFieldId,
    setSelectedFieldId,
    loading: formLoading || fieldsLoading,
    saving,
    formError,
    createNewField,
    deleteFieldFromDB,
    handleDragEnd,
    saveForm,
  };
};

