import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ServiceHistoryItem from '../components/ServiceHistoryItem';
import { Filter, Search } from 'lucide-react';
import { ServiceRecord, Vehicle, Device } from '../utils/types';
import { 
  mapSupabaseServiceRecordToServiceRecord,
  mapSupabaseVehicleToVehicle,
  mapSupabaseDeviceToDevice
} from '@/utils/supabaseMappers';

const History = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allServiceRecords, setAllServiceRecords] = useState<ServiceRecord[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const [recordsRes, vehiclesRes, devicesRes] = await Promise.all([
        supabase.from('service_records').select('*'),
        supabase.from('vehicles').select('*'),
        supabase.from('devices').select('*')
      ]);

      if (recordsRes.error || vehiclesRes.error || devicesRes.error) {
        toast.error("Wystąpił błąd podczas pobierania historii serwisowej.");
        console.error(recordsRes.error || vehiclesRes.error || devicesRes.error);
        return;
      }
      
      setAllServiceRecords(recordsRes.data.map(mapSupabaseServiceRecordToServiceRecord));
      setAllVehicles(vehiclesRes.data.map(mapSupabaseVehicleToVehicle));
      setAllDevices(devicesRes.data.map(mapSupabaseDeviceToDevice));
    };

    fetchData();
  }, []);
  
  const filteredRecords = allServiceRecords.filter(record => {
    const searchLower = searchQuery.toLowerCase();
    
    // Search in record details
    if (
      record.description.toLowerCase().includes(searchLower) ||
      record.technician.toLowerCase().includes(searchLower) ||
      record.type.toLowerCase().includes(searchLower)
    ) {
      return true;
    }
    
    // Search in related vehicle
    if (record.vehicleId) {
      const vehicle = allVehicles.find(v => v.id === record.vehicleId);
      if (vehicle && (
        vehicle.name.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        (vehicle.brand && vehicle.brand.toLowerCase().includes(searchLower))
      )) {
        return true;
      }
    }
    
    // Search in related device
    if (record.deviceId) {
      const device = allDevices.find(d => d.id === record.deviceId);
      if (device && (
        device.name.toLowerCase().includes(searchLower) ||
        device.type.toLowerCase().includes(searchLower) ||
        (device.model && device.model.toLowerCase().includes(searchLower))
      )) {
        return true;
      }
      
      // Also search in the device's associated vehicle
      if (device && device.vehicleId) {
        const vehicle = allVehicles.find(v => v.id === device.vehicleId);
        if (vehicle && (
          vehicle.name.toLowerCase().includes(searchLower) ||
          vehicle.model.toLowerCase().includes(searchLower) ||
          (vehicle.brand && vehicle.brand.toLowerCase().includes(searchLower))
        )) {
          return true;
        }
      }
    }
    
    return false;
  });
  
  // Sort records by date (newest first)
  filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Function to get vehicle and device information for a service record
  const getItemInfo = (record: ServiceRecord) => {
    let vehicleName, vehicleModel, deviceName, deviceModel, deviceThumbnail;
    
    if (record.vehicleId) {
      const vehicle = allVehicles.find(v => v.id === record.vehicleId);
      if (vehicle) {
        vehicleName = vehicle.name;
        vehicleModel = vehicle.model;
      }
    }
    
    if (record.deviceId) {
      const device = allDevices.find(d => d.id === record.deviceId);
      if (device) {
        deviceName = device.name;
        deviceModel = device.model || device.type;
        deviceThumbnail = device.thumbnail;
        
        // If device is connected to a vehicle, get the vehicle info
        if (device.vehicleId && !record.vehicleId) {
          const vehicle = allVehicles.find(v => v.id === device.vehicleId);
          if (vehicle) {
            vehicleName = vehicle.name;
            vehicleModel = vehicle.model;
          }
        }
      }
    }
    
    return { vehicleName, vehicleModel, deviceName, deviceModel, deviceThumbnail };
  };
  
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Historia Serwisu</h1>
            <p className="text-muted-foreground">Przeglądaj wszystkie poprzednie zapisy serwisowe</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Szukaj zapisów..."
                className="pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button className="flex items-center justify-center space-x-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md transition-colors">
              <Filter className="h-5 w-5" />
              <span>Filtruj</span>
            </button>
          </div>
        </div>
        
        {filteredRecords.length > 0 ? (
          <div className="space-y-4">
            {filteredRecords.map((record, index) => {
              const { vehicleName, vehicleModel, deviceName, deviceModel, deviceThumbnail } = getItemInfo(record);
              
              return (
                <ServiceHistoryItem 
                  key={record.id} 
                  record={record}
                  delay={index % 5 + 1}
                  vehicleName={vehicleName}
                  vehicleModel={vehicleModel}
                  deviceName={deviceName}
                  deviceModel={deviceModel}
                  deviceThumbnail={deviceThumbnail}
                />
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <div className="icon-container mx-auto mb-4">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nie znaleziono zapisów</h3>
            <p className="text-muted-foreground">
              Żadne zapisy serwisowe nie pasują do kryteriów wyszukiwania. Spróbuj innego zapytania.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
