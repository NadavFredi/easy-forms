import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormBuilder } from './FormBuilder.module';
import { FormField, FieldType } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  const navigate = useNavigate();
  const {
    form,
    fields: initialFields,
    selectedFieldId,
    setSelectedFieldId,
    loading,
    saving,
    formError,
    createNewField,
    deleteFieldFromDB,
    handleDragEnd: handleDragEndHook,
    saveForm: saveFormHook,
  } = useFormBuilder();

  // Local state for editing
  const [localForm, setLocalForm] = useState(form);
  const [localFields, setLocalFields] = useState<FormField[]>(initialFields);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync with hook data
  useEffect(() => {
    if (form) setLocalForm(form);
  }, [form]);

  useEffect(() => {
    setLocalFields(initialFields);
  }, [initialFields]);

  const addField = (type: FieldType = 'text') => {
    const newField = createNewField(type);
    setLocalFields([...localFields, newField]);
    setSelectedFieldId(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setLocalFields(localFields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)));
  };

  const deleteField = async (fieldId: string) => {
    if (fieldId.startsWith('temp-')) {
      setLocalFields(localFields.filter((f) => f.id !== fieldId));
      if (selectedFieldId === fieldId) {
        setSelectedFieldId(null);
      }
    } else {
      try {
        await deleteFieldFromDB(fieldId);
        setLocalFields(localFields.filter((f) => f.id !== fieldId));
        if (selectedFieldId === fieldId) {
          setSelectedFieldId(null);
        }
      } catch (error) {
        // Error already handled in hook
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const reorderedFields = await handleDragEndHook(event, localFields);
    if (reorderedFields) {
      setLocalFields(reorderedFields);
    }
  };

  const saveForm = async () => {
    if (!localForm) return;
    await saveFormHook(localForm, localFields);
  };

  const selectedField = localFields.find((f) => f.id === selectedFieldId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!localForm) {
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
                value={localForm.title}
                onChange={(e) => setLocalForm({ ...localForm, title: e.target.value })}
                className="text-xl font-bold border-0 focus-visible:ring-0 p-0 h-auto"
                placeholder="Form Title"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(`/f/${localForm.slug}`, '_blank')}
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
                    onClick={() => addField(type as FieldType)}
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
                  value={localForm.slug}
                  onChange={(e) => setLocalForm({ ...localForm, slug: e.target.value })}
                  placeholder="form-slug"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={localForm.description || ''}
                  onChange={(e) => setLocalForm({ ...localForm, description: e.target.value })}
                  placeholder="Form description"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={localForm.is_published}
                  onCheckedChange={(checked) =>
                    setLocalForm({ ...localForm, is_published: checked })
                  }
                />
                <Label htmlFor="published">Published</Label>
              </div>
            </div>
          </div>

          {/* Center - Form Preview */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Form Preview</h3>
            <div className="border rounded-lg p-6 bg-accent/30 min-h-[400px]">
              {localFields.length === 0 ? (
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
                    items={localFields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {localFields.map((field) => (
                        <SortableField
                          key={field.id}
                          field={field}
                          isSelected={selectedFieldId === field.id}
                          onSelect={() => setSelectedFieldId(field.id)}
                          onDelete={() => deleteField(field.id)}
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
                onChange={(updates) => updateField(selectedField.id, updates)}
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

