import { Wrench, Check, Clock, AlertTriangle, Car, Edit, Trash2, Eye } from 'lucide-react';
import { Equipment } from '../utils/types';
import { formatDate } from '../utils/formatting/dateUtils';
import { Button } from '@/components/ui/button';

interface EquipmentCardProps {
  equipment: Equipment;
  delay?: number;
  onEdit?: (equipment: Equipment) => void;
  onDelete?: (equipment: Equipment) => void;
  onViewDetails?: (equipment: Equipment) => void;
  actions?: React.ReactNode;
  onAttachmentClick?: (url: string) => void;
}

const EquipmentCard = ({ 
  equipment, 
  delay = 0, 
  onEdit, 
  onDelete, 
  onViewDetails, 
  actions,
  onAttachmentClick 
}: EquipmentCardProps) => {
  const delayClass = `staggered-delay-${delay}`;
  
  const getStatusIcon = () => {
    switch (equipment.status) {
      case 'ok':
        return <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600"><Check className="h-4 w-4" /></div>;
      case 'needs-service':
        return <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Clock className="h-4 w-4" /></div>;
      case 'in-service':
        return <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Wrench className="h-4 w-4" /></div>;
      case 'error':
        return <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-600"><AlertTriangle className="h-4 w-4" /></div>;
      default:
        return null;
    }
  };
  
  return (
    <div className={`glass-card rounded-xl p-3 opacity-0 animate-fade-in ${delayClass} hover:shadow-elevated transition-all w-full`}>
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          {equipment.thumbnail ? (
            <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0 bg-background/50 flex items-center justify-center border border-border/30">
              <img 
                src={equipment.thumbnail} 
                alt={equipment.name} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0 bg-background/50 flex items-center justify-center border border-border/30">
              <Wrench className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-secondary text-foreground/70 rounded-full">
                {equipment.type?.charAt(0).toUpperCase() + equipment.type?.slice(1) || 'Wyposażenie'}
              </span>
              <h3 className="text-md font-semibold">{equipment.name}</h3>
            </div>
            
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Marka</span>
                <span className="font-medium">{equipment.brand || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">S/N</span>
                <span className="font-medium">{equipment.serialNumber}</span>
              </div>
              {equipment.vehicleId && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Pojazd</span>
                  <span className="inline-flex items-center">
                    <Car className="h-3 w-3 mr-1" />
                    #{equipment.vehicleId.slice(0, 8)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Rok</span>
                <span className="font-medium">{equipment.year || '-'}</span>
              </div>
            </div>
          </div>
        </div>
        {getStatusIcon()}
      </div>
      
      <div className="flex justify-end mt-3 gap-1">
        {actions ? (
          actions
        ) : (
          <>
            <Button 
              variant="secondary"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onViewDetails && onViewDetails(equipment)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Szczegóły
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onEdit && onEdit(equipment)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edytuj
            </Button>
            <Button 
              variant="destructive"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onDelete && onDelete(equipment)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Usuń
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default EquipmentCard;