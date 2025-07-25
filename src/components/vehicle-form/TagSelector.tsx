
import { useState, useRef, useEffect } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TAG_COLORS = [
  { name: "blue", value: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
  { name: "red", value: "bg-red-100 text-red-800 hover:bg-red-200" },
  { name: "green", value: "bg-green-100 text-green-800 hover:bg-green-200" },
  { name: "purple", value: "bg-purple-100 text-purple-800 hover:bg-purple-200" },
  { name: "yellow", value: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
  { name: "indigo", value: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200" },
  { name: "pink", value: "bg-pink-100 text-pink-800 hover:bg-pink-200" },
  { name: "orange", value: "bg-orange-100 text-orange-800 hover:bg-orange-200" },
  { name: "cyan", value: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200" },
  { name: "gray", value: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
];

interface TagSelectorProps {
  value: string;
  onChange: (value: string) => void;
  availableTags?: string[];
  autoFocus?: boolean;
  onRemoveTagFromDatabase?: (tagName: string) => void;
}

const TagSelector = ({ 
  value, 
  onChange, 
  availableTags = [], 
  autoFocus = false,
  onRemoveTagFromDatabase 
}: TagSelectorProps) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [colorIndex, setColorIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (value) {
      setSelectedTags(value.split(",").map(tag => tag.trim()).filter(tag => tag !== ""));
    } else {
      setSelectedTags([]);
    }
    
    if (value) {
      const tagsCount = value.split(",").filter(tag => tag.trim() !== "").length;
      setColorIndex(tagsCount % TAG_COLORS.length);
    }
  }, [value]);
  
  const extractTagSuggestions = () => {
    const suggestions: { name: string; color: string }[] = [];
    availableTags.forEach(tag => {
      const [name, color] = tag.split(':');
      if (name && !suggestions.some(s => s.name === name.trim())) {
        suggestions.push({ 
          name: name.trim(), 
          color: color ? color.trim() : 'blue' 
        });
      }
    });
    return suggestions;
  };
  
  const tagSuggestions = extractTagSuggestions();
  
  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * TAG_COLORS.length);
    return TAG_COLORS[randomIndex].name;
  };
  
  const handleAddTag = () => {
    if (!inputValue.trim()) {
      return;
    }
    
    const tagColor = getRandomColor();
    const newTag = `${inputValue.trim()}:${tagColor}`;
    
    if (selectedTags.some(tag => tag.split(':')[0].trim() === inputValue.trim())) {
      toast("Tag już istnieje", {
        description: "Ten tag jest już dodany do pojazdu.",
      });
      return;
    }
    
    const newTags = [...selectedTags, newTag];
    setSelectedTags(newTags);
    onChange(newTags.join(", "));
    
    setInputValue("");
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    onChange(newTags.join(", "));
  };
  
  const handleSelectSuggestion = (suggestion: { name: string; color: string }) => {
    const newTag = `${suggestion.name}:${suggestion.color}`;
    
    if (selectedTags.some(tag => tag.split(':')[0].trim() === suggestion.name)) {
      toast("Tag już istnieje", {
        description: "Ten tag jest już dodany do pojazdu.",
      });
      return;
    }
    
    const newTags = [...selectedTags, newTag];
    setSelectedTags(newTags);
    onChange(newTags.join(", "));
  };

  const handleRemoveTagFromDatabase = (tagName: string) => {
    if (onRemoveTagFromDatabase) {
      onRemoveTagFromDatabase(tagName);
      toast.success(`Tag "${tagName}" został usunięty z bazy tagów`, {
        description: "Tag nie będzie więcej dostępny do wyboru."
      });
    }
  };
  
  const renderTagBadges = () => {
    return selectedTags.map((tag, index) => {
      const [name, color] = tag.split(':');
      const colorClass = getTagColorClass(color || 'blue');
      
      return (
        <Badge 
          key={index} 
          className={`${colorClass} rounded-md px-2 py-1 text-xs font-medium mr-1 mb-1`}
        >
          {name}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
            onClick={() => handleRemoveTag(tag)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      );
    });
  };
  
  const getTagColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      red: "bg-red-100 text-red-800 hover:bg-red-200",
      green: "bg-green-100 text-green-800 hover:bg-green-200",
      purple: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      yellow: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      indigo: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
      pink: "bg-pink-100 text-pink-800 hover:bg-pink-200",
      orange: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      gray: "bg-gray-100 text-gray-800 hover:bg-gray-200",
      cyan: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
    };
    
    return colorMap[colorName] || colorMap.blue;
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 border rounded-md p-2 min-h-10">
        {selectedTags.length > 0 ? (
          renderTagBadges()
        ) : (
          <div className="text-muted-foreground text-sm p-1">Brak tagów</div>
        )}
        
        {tagSuggestions.length > 0 && (
          <div className="w-full mt-2">
            <div className="text-xs text-muted-foreground mb-1">Wybierz tag:</div>
            <div className="flex flex-wrap gap-1">
              {tagSuggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-center">
                  <Badge 
                    className={`${getTagColorClass(suggestion.color)} cursor-pointer`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectSuggestion(suggestion);
                      }
                    }}
                  >
                    {suggestion.name}
                  </Badge>
                  {onRemoveTagFromDatabase && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-1 text-red-500 hover:text-red-700 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTagFromDatabase(suggestion.name);
                      }}
                      title="Usuń tag z bazy danych"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="w-full flex items-center mt-2 gap-2">
          <Input
            ref={inputRef}
            placeholder="Wpisz nazwę tagu"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-8 flex-grow"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                e.preventDefault();
                handleAddTag();
              }
            }}
            autoFocus={autoFocus}
          />
          
          <Button 
            type="button"
            size="sm"
            className="h-8"
            onClick={handleAddTag}
            disabled={!inputValue.trim()}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Dodaj
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TagSelector;
