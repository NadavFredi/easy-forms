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
  ChevronLeft,
  ChevronRight,
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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
  onChange: (updates: Partial<FormField>) => void;
}

function SortableField({ field, isSelected, onSelect, onDelete, onChange }: SortableFieldProps) {
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

  const isContentField = ['header', 'paragraph', 'link', 'separator'].includes(field.type);
  const hasPlaceholder = !isContentField && field.type !== 'checkbox';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 bg-white transition-all shadow-sm overflow-hidden ${
        isSelected ? 'ring-2 ring-primary border-primary' : 'border-gray-200 hover:border-primary/50 hover:shadow-md cursor-pointer'
      }`}
      onClick={!isSelected ? onSelect : undefined}
    >
      <div className="flex items-start gap-2 overflow-hidden">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden space-y-2" onClick={(e) => e.stopPropagation()}>
          {/* Editable Label */}
          {!isContentField ? (
            <div className="space-y-1">
              {isSelected ? (
                <Input
                  value={field.label}
                  onChange={(e) => onChange({ label: e.target.value })}
                  placeholder="תווית שדה"
                  className="text-sm font-medium h-8"
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                />
              ) : (
                <Label className="text-sm font-medium break-words break-all block">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
              )}
            </div>
          ) : field.type === 'header' ? (
            isSelected ? (
              <Input
                value={field.label}
                onChange={(e) => onChange({ label: e.target.value })}
                placeholder="כותרת"
                className="text-2xl font-bold"
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
              />
            ) : (
              <h2 className="text-2xl font-bold">{field.label}</h2>
            )
          ) : field.type === 'paragraph' ? (
            isSelected ? (
              <Textarea
                value={field.label}
                onChange={(e) => onChange({ label: e.target.value })}
                placeholder="פסקה"
                rows={3}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
              />
            ) : (
              <p className="text-muted-foreground whitespace-pre-wrap break-words break-all">{field.label}</p>
            )
          ) : null}

          {/* Field Input */}
          <div onClick={(e) => e.stopPropagation()}>
            {field.type === 'text' || field.type === 'email' || field.type === 'url' || field.type === 'tel' || field.type === 'password' ? (
              <Input
                type={field.type}
                value={isSelected && hasPlaceholder ? (field.placeholder || '') : ''}
                placeholder={isSelected && hasPlaceholder ? 'טקסט מקום' : field.placeholder}
                required={field.required}
                disabled={!isSelected}
                onChange={(e) => {
                  if (isSelected && hasPlaceholder) {
                    onChange({ placeholder: e.target.value });
                  }
                }}
                onFocus={(e) => e.stopPropagation()}
                className={isSelected ? 'bg-gray-50' : ''}
              />
            ) : field.type === 'number' ? (
              <Input
                type="text"
                value={isSelected && hasPlaceholder ? (field.placeholder || '') : ''}
                placeholder={isSelected && hasPlaceholder ? 'טקסט מקום' : field.placeholder}
                required={field.required}
                disabled={!isSelected}
                onChange={(e) => {
                  if (isSelected && hasPlaceholder) {
                    onChange({ placeholder: e.target.value });
                  }
                }}
                onFocus={(e) => e.stopPropagation()}
                className={isSelected ? 'bg-gray-50' : ''}
              />
            ) : field.type === 'textarea' ? (
              <Textarea
                value={isSelected && hasPlaceholder ? (field.placeholder || '') : ''}
                placeholder={isSelected && hasPlaceholder ? 'טקסט מקום' : field.placeholder}
                required={field.required}
                disabled={!isSelected}
                rows={4}
                onChange={(e) => {
                  if (isSelected && hasPlaceholder) {
                    onChange({ placeholder: e.target.value });
                  }
                }}
                onFocus={(e) => e.stopPropagation()}
                className={isSelected ? 'bg-gray-50' : ''}
              />
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.id}
                  required={field.required}
                  disabled
                />
                {isSelected ? (
                  <Input
                    value={field.label}
                    onChange={(e) => onChange({ label: e.target.value })}
                    placeholder="תווית"
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Label htmlFor={field.id} className="font-normal break-words break-all">
                    {field.label}
                  </Label>
                )}
              </div>
            ) : field.type === 'select' ? (
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || 'בחר אפשרות'} />
                </SelectTrigger>
                <SelectContent>
                  {(field.options?.options || []).map((option: string, index: number) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'radio' ? (
              <RadioGroup disabled>
                {(field.options?.options || []).map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                    <Label htmlFor={`${field.id}-${index}`} className="font-normal break-words break-all">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : field.type === 'multiselect' ? (
              <div className="space-y-2">
                {(field.options?.options || []).map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox id={`${field.id}-${index}`} disabled />
                    <Label htmlFor={`${field.id}-${index}`} className="font-normal break-words break-all">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            ) : field.type === 'file' ? (
              <Input type="file" required={field.required} disabled />
            ) : field.type === 'date' ? (
              <Input type="date" required={field.required} disabled />
            ) : field.type === 'time' ? (
              <Input type="time" required={field.required} disabled />
            ) : field.type === 'link' ? (
              isSelected ? (
                <div className="space-y-2">
                  <Input
                    value={field.label}
                    onChange={(e) => onChange({ label: e.target.value })}
                    placeholder="טקסט קישור"
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                  />
                  <Input
                    value={field.options?.url || ''}
                    onChange={(e) => onChange({ options: { ...field.options, url: e.target.value } })}
                    placeholder="https://example.com"
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                <a
                  href={field.options?.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-words break-all"
                >
                  {field.label}
                </a>
              )
            ) : field.type === 'separator' ? (
              <Separator />
            ) : null}
          </div>

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
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-1.5 border border-gray-200 rounded-md bg-white shadow-sm">
                <Label htmlFor="published" className="text-sm font-medium cursor-pointer mb-0 leading-none whitespace-nowrap select-none">
                  פורסם
                </Label>
                <div className="flex items-center justify-center h-6 w-11 flex-shrink-0">
                  <Switch
                    id="published"
                    checked={localForm.is_published}
                    onCheckedChange={(checked) =>
                      setLocalForm({ ...localForm, is_published: checked })
                    }
                  />
                </div>
              </div>
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

      <div className="flex h-[calc(100vh-73px)] overflow-hidden">
        {/* Left Sidebar - Field Types */}
        <div
          className={`relative transition-all duration-300 ease-in-out bg-white border-r border-gray-200 overflow-y-auto ${
            leftSidebarOpen ? 'w-64' : 'w-0'
          }`}
        >
          {leftSidebarOpen && (
            <div className="space-y-4 p-4">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-900">הוסף שדה</h3>
              <div className="grid grid-cols-2 gap-2">
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
                    className="flex flex-col items-center justify-center h-16 p-2 hover:bg-gray-50 hover:border-primary/50 hover:shadow-sm transition-all duration-200"
                  >
                    <Icon className="h-4 w-4 mb-1 text-gray-700" />
                    <span className="text-xs text-gray-600 leading-tight">{label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Form Settings */}
            <div className="space-y-3 border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-900">הגדרות טופס</h3>
              <div className="space-y-1.5">
                <Label className="text-xs">כתובת URL</Label>
                <Input
                  value={localForm.slug}
                  onChange={(e) => setLocalForm({ ...localForm, slug: e.target.value })}
                  placeholder="כתובת-טופס"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">תיאור</Label>
                <Textarea
                  value={localForm.description || ''}
                  onChange={(e) => setLocalForm({ ...localForm, description: e.target.value })}
                  placeholder="תיאור הטופס"
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>
            </div>
          )}
          {/* Left Sidebar Toggle */}
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 bg-white border border-gray-200 rounded-full p-2 shadow-md hover:bg-gray-50 transition-all`}
          >
            {leftSidebarOpen ? (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Center - Form Preview (80% width) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
            <h3 className="text-lg font-semibold text-gray-900">תצוגה מקדימה</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto w-full">
              <div className="border border-gray-200 rounded-lg p-8 bg-white shadow-sm min-h-full">
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
                                    onChange={(updates) => updateField(field.id, updates)}
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
          </div>
        </div>

        {/* Right Sidebar - Field Editor */}
        <div
          className={`relative transition-all duration-300 ease-in-out bg-white border-l border-gray-200 overflow-y-auto ${
            rightSidebarOpen ? 'w-80' : 'w-0'
          }`}
        >
          {rightSidebarOpen && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">הגדרות שדה</h3>
              </div>
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
          )}
          {/* Right Sidebar Toggle */}
          <button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className={`absolute left-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 bg-white border border-gray-200 rounded-full p-2 shadow-md hover:bg-gray-50 transition-all`}
          >
            {rightSidebarOpen ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;

