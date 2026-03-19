"use client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { GripVertical } from "lucide-react";
import FormFieldRenderer from "./FormFieldRenderer";

// Drop zone between fields for adding new fields
const DropZone = ({ onDrop, index, isVisible }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("application/json")) {
      setIsOver(true);
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    console.log("🎯 Drop zone triggered at index:", index);
    onDrop(e, index);
  };

  return (
    <div
      className={`h-4 transition-all duration-200 ${
        isOver ? "bg-tacir-blue/30 scale-105" : "bg-transparent"
      } ${isVisible ? "block" : "hidden"}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`h-1 mx-4 rounded-full transition-all ${
          isOver
            ? "bg-tacir-blue scale-105 animate-pulse"
            : "bg-tacir-lightgray/30 hover:bg-tacir-blue/50"
        }`}
      />
    </div>
  );
};

// Field Drag Overlay
const FieldDragOverlay = ({ field }) => {
  return (
    <div className="transform rotate-2 opacity-90 shadow-xl cursor-grabbing">
      <div className="ml-8">
        <FormFieldRenderer
          field={field}
          previewMode={true}
          className="border-tacir-blue bg-tacir-blue/5 ring-2 ring-tacir-blue/20 shadow-lg"
        />
      </div>
    </div>
  );
};

// Main FormCanvas component
const FormCanvas = ({
  fields,
  onReorderFields,
  onSelectField,
  onRemoveField,
  selectedFieldId,
  onAddField,
}) => {
  const [activeId, setActiveId] = useState(null);
  const [isReceivingNewField, setIsReceivingNewField] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ===== REORDERING LOGIC =====
  const handleReorderDragStart = (event) => {
    const { active } = event;
    console.log("🔄 Reorder drag started:", active.id);
    setActiveId(active.id);
  };

  const handleReorderDragEnd = (event) => {
    const { active, over } = event;
    console.log(
      "🔄 Reorder drag ended - Active:",
      active.id,
      "Over:",
      over?.id
    );
    setActiveId(null);

    if (active.id !== over?.id && over) {
      const oldIndex = fields.findIndex(
        (field) => (field.id || field._id) === active.id
      );
      const newIndex = fields.findIndex(
        (field) => (field.id || field._id) === over.id
      );

      console.log("🔄 Reordering field:", { from: oldIndex, to: newIndex });

      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = arrayMove(fields, oldIndex, newIndex);
        onReorderFields(newFields);
      }
    }
  };

  const handleReorderDragCancel = () => {
    console.log("❌ Reorder drag cancelled");
    setActiveId(null);
  };

  // ===== ADDING NEW FIELDS LOGIC =====
  const handleNewFieldDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("🎯 New field drop at index:", dropIndex);

    try {
      const dragDataString = e.dataTransfer.getData("application/json");
      console.log("📦 Drag data received:", dragDataString);

      if (dragDataString) {
        const dragData = JSON.parse(dragDataString);
        console.log("➕ Adding new field:", {
          component: dragData.component,
          isTemplate: dragData.isTemplate,
          dropIndex: dropIndex,
        });

        if (onAddField) {
          onAddField(dragData.component, dragData.isTemplate, dropIndex);
          console.log("✅ onAddField called successfully");
        } else {
          console.error("❌ onAddField function is not provided");
        }
      } else {
        console.log("❌ No drag data found in dataTransfer");
      }
    } catch (error) {
      console.error("❌ Error parsing drag data:", error);
    }

    setIsReceivingNewField(false);
  };

  // Container drag handlers
  const handleContainerDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("application/json")) {
      e.dataTransfer.dropEffect = "copy";
      setIsReceivingNewField(true);
    }
  };

  const handleContainerDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsReceivingNewField(false);
    }
  };

  const activeField = activeId
    ? fields.find((field) => (field.id || field._id) === activeId)
    : null;

  // Debug: Check if onAddField is available
  console.log("🔧 FormCanvas props:", {
    hasOnAddField: !!onAddField,
    fieldsCount: fields?.length,
  });

  if (!fields || fields.length === 0) {
    return (
      <ScrollArea className="h-full">
        <Card
          className={`min-h-[520px] mx-6 flex items-center justify-center transition-all duration-200 ${
            isReceivingNewField
              ? "bg-tacir-blue/10 border-2 border-tacir-blue border-dashed"
              : "bg-gray-50"
          }`}
          onDragOver={handleContainerDragOver}
          onDragEnter={handleContainerDragOver}
          onDragLeave={handleContainerDragLeave}
          onDrop={(e) => {
            console.log("🎯 Drop on empty canvas");
            handleNewFieldDrop(e, 0);
          }}
        >
          <div className="text-center text-tacir-darkgray">
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${
                isReceivingNewField
                  ? "bg-tacir-blue/20 border-2 border-tacir-blue border-dashed animate-pulse"
                  : "bg-tacir-lightgray/20"
              }`}
            >
              <GripVertical
                className={`w-8 h-8 transition-colors ${
                  isReceivingNewField
                    ? "text-tacir-blue"
                    : "text-tacir-darkgray/40"
                }`}
              />
            </div>
            <p
              className={`text-lg font-medium mb-2 transition-colors ${
                isReceivingNewField ? "text-tacir-blue" : "text-tacir-darkblue"
              }`}
            >
              {isReceivingNewField
                ? "Relâchez pour ajouter le champ"
                : "Commencez à créer votre formulaire"}
            </p>
            <p className="text-sm">
              {isReceivingNewField
                ? "Le nouveau champ sera ajouté ici"
                : "Glissez des champs depuis la palette ou cliquez pour les ajouter"}
            </p>
            {!onAddField && (
              <p className="text-red-500 text-xs mt-2">
                ❌ onAddField not available - cannot add new fields
              </p>
            )}
          </div>
        </Card>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full bg-gradient-to-br from-tacir-blue/2 to-tacir-lightblue/2">
      <div
        className="p-6"
        onDragOver={handleContainerDragOver}
        onDragLeave={handleContainerDragLeave}
      >
        {/* Instructions */}
        <div className="mb-6 p-4 bg-tacir-blue/5 border border-tacir-blue/20 rounded-lg">
          <p className="text-sm text-tacir-blue flex items-center gap-2 justify-center text-center">
            <GripVertical className="w-4 h-4 flex-shrink-0" />
            <span>
              Glissez les poignées pour réorganiser • Glissez entre les lignes
              pour insérer
            </span>
          </p>
          {!onAddField && (
            <p className="text-red-500 text-xs mt-2 text-center">
              ❌ Warning: Adding new fields is not available
            </p>
          )}
        </div>

        {/* DndContext for REORDERING existing fields */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleReorderDragStart}
          onDragEnd={handleReorderDragEnd}
          onDragCancel={handleReorderDragCancel}
        >
          <SortableContext
            items={fields.map((field) => field.id || field._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-0">
              {/* Drop zone at the very beginning */}
              <DropZone
                onDrop={handleNewFieldDrop}
                index={0}
                isVisible={true}
              />

              {fields.map((field, index) => (
                <div key={field.id || field._id}>
                  {/* Render FormFieldRenderer directly with sortable props */}
                  <SortableFieldItem
                    field={field}
                    onSelectField={onSelectField}
                    onRemoveField={onRemoveField}
                    isSelected={selectedFieldId === (field.id || field._id)}
                  />

                  {/* Drop zone after each field */}
                  <DropZone
                    onDrop={handleNewFieldDrop}
                    index={index + 1}
                    isVisible={true}
                  />
                </div>
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activeField ? <FieldDragOverlay field={activeField} /> : null}
          </DragOverlay>
        </DndContext>

        {/* Drop zone at the end */}
        <div
          className={`mt-6 p-6 border-2 border-dashed rounded-lg text-center transition-all duration-200 cursor-pointer ${
            isReceivingNewField
              ? "border-tacir-blue bg-tacir-blue/10 scale-105 animate-pulse"
              : "border-tacir-lightgray/30 bg-tacir-blue/5 hover:border-tacir-blue/50 hover:bg-tacir-blue/5"
          }`}
          onDragOver={handleContainerDragOver}
          onDragEnter={handleContainerDragOver}
          onDragLeave={handleContainerDragLeave}
          onDrop={(e) => {
            console.log("🎯 Drop on end zone");
            handleNewFieldDrop(e, fields.length);
          }}
        >
          <p
            className={`text-sm font-medium transition-colors ${
              isReceivingNewField ? "text-tacir-blue" : "text-tacir-darkgray"
            }`}
          >
            {isReceivingNewField
              ? "Relâchez pour ajouter à la fin"
              : "Déposez ici pour ajouter à la fin"}
          </p>
        </div>
      </div>
    </ScrollArea>
  );
};

// SortableFieldItem component that uses FormFieldRenderer directly
// In FormCanvas component - update the SortableFieldItem component
const SortableFieldItem = ({
  field,
  onSelectField,
  onRemoveField,
  isSelected,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id || field._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative transition-all duration-200
        ${isDragging ? "z-50" : ""}
      `}
    >
      {/* Now FormFieldRenderer handles the drag handle and styling */}
      <FormFieldRenderer
        field={field}
        onRemove={() => onRemoveField(field.id)}
        onClick={() => onSelectField(field)}
        isSelected={isSelected}
        previewMode={isDragging}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
      />
    </div>
  );
};

export default FormCanvas;
