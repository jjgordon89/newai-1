import React, { useState, useEffect } from "react";
import { X, Plus, Tag, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { StoredDocument } from "@/lib/documentStorage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface DocumentMetadataEditorProps {
  document: StoredDocument;
  onSave: (updates: Partial<StoredDocument>) => void;
  onCancel: () => void;
}

const DocumentMetadataEditor: React.FC<DocumentMetadataEditorProps> = ({
  document,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(document.title);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [customFields, setCustomFields] = useState<
    { key: string; value: string }[]
  >([]);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [metadataJson, setMetadataJson] = useState(
    JSON.stringify(document.metadata, null, 2),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize form with document data
    setTitle(document.title);

    // Extract tags from metadata if available
    if (document.metadata && document.metadata.tags) {
      setTags(document.metadata.tags);
    }

    // Extract description from metadata if available
    if (document.metadata && document.metadata.description) {
      setDescription(document.metadata.description);
    }

    // Extract custom fields from metadata
    const metadataFields: { key: string; value: string }[] = [];
    if (document.metadata) {
      Object.entries(document.metadata).forEach(([key, value]) => {
        // Skip standard fields
        if (
          ![
            "fileName",
            "fileSize",
            "fileType",
            "uploadedAt",
            "version",
            "lastModified",
            "tags",
            "description",
          ].includes(key)
        ) {
          metadataFields.push({ key, value: String(value) });
        }
      });
    }
    setCustomFields(metadataFields);
  }, [document]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddCustomField = () => {
    if (newFieldKey.trim() && newFieldValue.trim()) {
      setCustomFields([
        ...customFields,
        { key: newFieldKey.trim(), value: newFieldValue.trim() },
      ]);
      setNewFieldKey("");
      setNewFieldValue("");
    }
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  const handleSave = () => {
    try {
      // Build updated metadata
      const updatedMetadata = { ...document.metadata };

      // Add tags
      updatedMetadata.tags = tags;

      // Add description
      if (description.trim()) {
        updatedMetadata.description = description.trim();
      }

      // Add custom fields
      customFields.forEach(({ key, value }) => {
        updatedMetadata[key] = value;
      });

      // Prepare updates
      const updates: Partial<StoredDocument> = {
        title,
        metadata: updatedMetadata,
        updatedAt: new Date().toISOString(),
      };

      onSave(updates);
    } catch (err) {
      setError("Error updating document metadata");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Document Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter document title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter document description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              className="pl-9"
              onKeyDown={(e) => handleKeyDown(e, handleAddTag)}
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleAddTag}
            disabled={!newTag.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Custom Fields</Label>
        {customFields.length > 0 && (
          <div className="space-y-2 mb-2">
            {customFields.map((field, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                  <span className="font-medium">{field.key}:</span>
                  <span>{field.value}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemoveCustomField(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={newFieldKey}
            onChange={(e) => setNewFieldKey(e.target.value)}
            placeholder="Field name"
            className="flex-1"
          />
          <Input
            value={newFieldValue}
            onChange={(e) => setNewFieldValue(e.target.value)}
            placeholder="Field value"
            className="flex-1"
            onKeyDown={(e) => handleKeyDown(e, handleAddCustomField)}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddCustomField}
            disabled={!newFieldKey.trim() || !newFieldValue.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default DocumentMetadataEditor;
