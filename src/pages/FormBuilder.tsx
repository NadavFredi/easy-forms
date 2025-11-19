import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Form, FormField } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Save, Eye, Plus, Trash2, GripVertical, ArrowLeft } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import FieldEditor from '@/components/FormBuilder/FieldEditor';
import FieldPreview from '@/components/FormBuilder/FieldPreview';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SortableFieldProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableField({ field, isSelected, onSelect, onDelete }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 bg-background cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : 'hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <FieldPreview field={field} />
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Field?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this field.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

const FormBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id && user) {
      loadForm();
    }
  }, [id, user]);

  const loadForm = async () => {
    try {
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (formError) throw formError;
      setForm(formData);

      const { data: fieldsData, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', id)
        .order('order_index', { ascending: true });

      if (fieldsError) throw fieldsError;
      setFields(fieldsData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const addField = (type: FormField['type'] = 'text') => {
    const newField: Partial<FormField> = {
      form_id: id!,
      type,
      label: type === 'header' ? 'Header' : type === 'paragraph' ? 'Paragraph' : 'New Field',
      placeholder: '',
      required: false,
      order_index: fields.length,
      width: 'full',
      options: type === 'select' || type === 'multiselect' || type === 'radio' 
        ? { options: ['Option 1', 'Option 2'] }
        : type === 'link'
        ? { url: '' }
        : undefined,
    };

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const fieldWithTempId = { ...newField, id: tempId } as FormField;
    setFields([...fields, fieldWithTempId]);
    setSelectedFieldId(tempId);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const deleteField = async (fieldId: string) => {
    try {
      const { error } = await supabase
        .from('form_fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;
      setFields(fields.filter(f => f.id !== fieldId));
      if (selectedFieldId === fieldId) {
        setSelectedFieldId(null);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newFields = arrayMove(items, oldIndex, newIndex).map((field, index) => ({
          ...field,
          order_index: index,
        }));

        return newFields;
      });
    }
  };

  const saveForm = async () => {
    if (!form) return;

    setSaving(true);
    try {
      // Update form
      const { error: formError } = await supabase
        .from('forms')
        .update({
          title: form.title,
          description: form.description,
          slug: form.slug,
          is_published: form.is_published,
        })
        .eq('id', form.id);

      if (formError) throw formError;

      // Get existing field IDs from database
      const { data: existingFields } = await supabase
        .from('form_fields')
        .select('id')
        .eq('form_id', form.id);

      const existingFieldIds = (existingFields || []).map(f => f.id);
      const currentFieldIds = fields.map(f => f.id).filter(Boolean) as string[];

      // Delete fields that were removed
      const fieldsToDelete = existingFieldIds.filter(id => !currentFieldIds.includes(id));
      if (fieldsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('form_fields')
          .delete()
          .in('id', fieldsToDelete);

        if (deleteError) throw deleteError;
      }

      // Upsert fields
      const updatedFields: FormField[] = [];
      for (const field of fields) {
        // Check if field has a real ID (not a temp ID)
        if (field.id && !field.id.startsWith('temp-')) {
          const { data, error } = await supabase
            .from('form_fields')
            .update({
              type: field.type,
              label: field.label,
              placeholder: field.placeholder,
              required: field.required,
              options: field.options,
              validation: field.validation,
              order_index: field.order_index,
              width: field.width,
            })
            .eq('id', field.id)
            .select()
            .single();

          if (error) throw error;
          updatedFields.push(data);
        } else {
          // Insert new field
          const { data, error } = await supabase
            .from('form_fields')
            .insert({
              form_id: form.id,
              type: field.type,
              label: field.label,
              placeholder: field.placeholder,
              required: field.required,
              options: field.options,
              validation: field.validation,
              order_index: field.order_index,
              width: field.width,
            })
            .select()
            .single();

          if (error) throw error;
          updatedFields.push(data);
        }
      }

      // Update local state with saved fields (to get IDs for new fields)
      setFields(updatedFields.sort((a, b) => a.order_index - b.order_index));

      toast({
        title: 'Success',
        description: 'Form saved successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="text-xl font-bold border-0 focus-visible:ring-0 p-0 h-auto"
                placeholder="Form Title"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(`/f/${form.slug}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={saveForm} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Field Types */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Add Field</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'text', label: 'Text' },
                  { type: 'email', label: 'Email' },
                  { type: 'number', label: 'Number' },
                  { type: 'textarea', label: 'Textarea' },
                  { type: 'select', label: 'Select' },
                  { type: 'multiselect', label: 'Multi-Select' },
                  { type: 'checkbox', label: 'Checkbox' },
                  { type: 'radio', label: 'Radio' },
                  { type: 'file', label: 'File' },
                  { type: 'date', label: 'Date' },
                  { type: 'time', label: 'Time' },
                  { type: 'url', label: 'URL' },
                  { type: 'header', label: 'Header' },
                  { type: 'paragraph', label: 'Paragraph' },
                  { type: 'link', label: 'Link' },
                  { type: 'separator', label: 'Separator' },
                ].map(({ type, label }) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => addField(type as FormField['type'])}
                    className="justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Form Settings */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Form Settings</h3>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="form-slug"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Form description"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={form.is_published}
                  onCheckedChange={(checked) => setForm({ ...form, is_published: checked })}
                />
                <Label htmlFor="published">Published</Label>
              </div>
            </div>
          </div>

          {/* Center - Form Preview */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Form Preview</h3>
            <div className="border rounded-lg p-6 bg-accent/30 min-h-[400px]">
              {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <p className="mb-4">No fields yet</p>
                  <p className="text-sm">Add fields from the left sidebar</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fields.map(f => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {fields.map((field) => (
                        <SortableField
                          key={field.id}
                          field={field}
                          isSelected={selectedFieldId === field.id}
                          onSelect={() => setSelectedFieldId(field.id)}
                          onDelete={() => {
                            if (field.id && !field.id.startsWith('temp-')) {
                              deleteField(field.id);
                            } else {
                              setFields(fields.filter(f => f.id !== field.id));
                              if (selectedFieldId === field.id) {
                                setSelectedFieldId(null);
                              }
                            }
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>

          {/* Right Sidebar - Field Editor */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Field Settings</h3>
            {selectedField ? (
              <FieldEditor
                field={selectedField}
                onChange={(updates) => updateField(selectedField.id!, updates)}
              />
            ) : (
              <div className="border rounded-lg p-8 text-center text-muted-foreground">
                <p>Select a field to edit</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;

