import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormBuilder } from './FormBuilder.module';
import { FormField, FieldType } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  GripVertical, 
  ArrowLeft,
  Type,
  Mail,
  Hash,
  FileText,
  List,
  ListChecks,
  CheckSquare,
  CircleDot,
  Upload,
  Calendar,
  Clock,
  Link as LinkIcon,
  Heading,
  AlignLeft,
  ExternalLink,
  Minus
} from 'lucide-react';
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
import Logo from '@/components/Logo';
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
      className={`border rounded-lg p-4 bg-white cursor-pointer transition-all shadow-sm overflow-hidden ${
        isSelected ? 'ring-2 ring-primary border-primary' : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-2 overflow-hidden">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded flex-shrink-0"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
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
              <AlertDialogTitle>למחוק שדה?</AlertDialogTitle>
              <AlertDialogDescription>
                פעולה זו לא ניתנת לביטול. זה ימחק לצמיתות את השדה הזה.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>מחק</AlertDialogAction>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">טוען...</div>
      </div>
    );
  }

  if (!localForm) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo showText={false} height={32} />
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 ml-2" />
                חזור
              </Button>
              <Input
                value={localForm.title}
                onChange={(e) => setLocalForm({ ...localForm, title: e.target.value })}
                className="text-xl font-bold border-0 focus-visible:ring-0 p-0 h-auto"
                placeholder="כותרת הטופס"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(`/f/${localForm.slug}`, '_blank')}
              >
                <Eye className="h-4 w-4 ml-2" />
                תצוגה מקדימה
              </Button>
              <Button onClick={saveForm} disabled={saving}>
                <Save className="h-4 w-4 ml-2" />
                {saving ? 'שומר...' : 'שמור'}
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
              <h3 className="text-lg font-semibold mb-4 text-gray-900">הוסף שדה</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'text', label: 'טקסט', icon: Type },
                  { type: 'email', label: 'אימייל', icon: Mail },
                  { type: 'number', label: 'מספר', icon: Hash },
                  { type: 'textarea', label: 'אזור טקסט', icon: FileText },
                  { type: 'select', label: 'בחירה', icon: List },
                  { type: 'multiselect', label: 'בחירה מרובה', icon: ListChecks },
                  { type: 'checkbox', label: 'תיבת סימון', icon: CheckSquare },
                  { type: 'radio', label: 'רדיו', icon: CircleDot },
                  { type: 'file', label: 'קובץ', icon: Upload },
                  { type: 'date', label: 'תאריך', icon: Calendar },
                  { type: 'time', label: 'שעה', icon: Clock },
                  { type: 'url', label: 'קישור', icon: LinkIcon },
                  { type: 'header', label: 'כותרת', icon: Heading },
                  { type: 'paragraph', label: 'פסקה', icon: AlignLeft },
                  { type: 'link', label: 'קישור חיצוני', icon: ExternalLink },
                  { type: 'separator', label: 'מפריד', icon: Minus },
                ].map(({ type, label, icon: Icon }) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => addField(type as FieldType)}
                    className="flex flex-col items-center justify-center h-20 p-2 hover:bg-gray-50 hover:border-primary/50 hover:shadow-sm transition-all duration-200"
                  >
                    <Icon className="h-5 w-5 mb-1 text-gray-700" />
                    <span className="text-xs text-gray-600">{label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Form Settings */}
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900">הגדרות טופס</h3>
              <div className="space-y-2">
                <Label>כתובת URL</Label>
                <Input
                  value={localForm.slug}
                  onChange={(e) => setLocalForm({ ...localForm, slug: e.target.value })}
                  placeholder="כתובת-טופס"
                />
              </div>
              <div className="space-y-2">
                <Label>תיאור</Label>
                <Textarea
                  value={localForm.description || ''}
                  onChange={(e) => setLocalForm({ ...localForm, description: e.target.value })}
                  placeholder="תיאור הטופס"
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
                <Label htmlFor="published">פורסם</Label>
              </div>
            </div>
          </div>

          {/* Center - Form Preview */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">תצוגה מקדימה</h3>
            <div className="border border-gray-200 rounded-lg p-6 bg-white min-h-[400px] shadow-md">
              {localFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <p className="mb-4 text-gray-600">אין עדיין שדות</p>
                  <p className="text-sm text-gray-400">הוסף שדות מהסרגל הצד</p>
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
                      {(() => {
                        // Group fields by row
                        const fieldsByRow = localFields.reduce((acc, field) => {
                          const row = field.row || 1;
                          if (!acc[row]) acc[row] = [];
                          acc[row].push(field);
                          return acc;
                        }, {} as Record<number, FormField[]>);

                        // Get sorted row numbers
                        const rowNumbers = Object.keys(fieldsByRow)
                          .map(Number)
                          .sort((a, b) => a - b);

                        // Render each row
                        const widthClasses = {
                          full: 'w-full',
                          half: 'w-full md:w-[calc(50%-0.5rem)]',
                          third: 'w-full md:w-[calc(33.333%-0.67rem)]',
                          quarter: 'w-full md:w-[calc(25%-0.75rem)]',
                        };
                        return rowNumbers.map((rowNum) => (
                          <div key={rowNum} className="flex flex-wrap gap-4">
                            {fieldsByRow[rowNum]
                              .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                              .map((field) => (
                                <div key={field.id} className={widthClasses[field.width] || 'w-full'}>
                                  <SortableField
                                    field={field}
                                    isSelected={selectedFieldId === field.id}
                                    onSelect={() => setSelectedFieldId(field.id)}
                                    onDelete={() => deleteField(field.id)}
                                  />
                                </div>
                              ))}
                          </div>
                        ));
                      })()}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>

          {/* Right Sidebar - Field Editor */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">הגדרות שדה</h3>
            {selectedField ? (
              <FieldEditor
                field={selectedField}
                onChange={(updates) => updateField(selectedField.id, updates)}
              />
            ) : (
              <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500 bg-white shadow-sm">
                <p>בחר שדה לעריכה</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;

