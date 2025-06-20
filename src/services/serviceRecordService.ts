import { supabase } from '@/integrations/supabase/client';
import { ServiceRecord } from '@/utils/types';
import { mapSupabaseServiceRecordToServiceRecord, mapServiceRecordToSupabaseServiceRecord } from '@/utils/supabaseMappers';
import { uploadMultipleFiles } from '@/utils/fileUpload';

export const createServiceRecord = async (serviceData: Partial<ServiceRecord>, images: File[] = [], attachments: File[] = []): Promise<ServiceRecord> => {
  try {
    console.log('Creating service record with files:', { images: images.length, attachments: attachments.length });
    
    // Upload files to storage
    const uploadedImages = images.length > 0 ? await uploadMultipleFiles(images, 'service-records/images') : [];
    const uploadedAttachments = attachments.length > 0 ? await uploadMultipleFiles(attachments, 'service-records/attachments') : [];

    console.log('Files uploaded:', { uploadedImages, uploadedAttachments });

    // Prepare data for database
    const serviceForDb = mapServiceRecordToSupabaseServiceRecord({
      ...serviceData,
      images: uploadedImages.map(img => img.url),
      attachments: uploadedAttachments.map((att, index) => ({
        name: attachments[index]?.name || '',
        type: attachments[index]?.type || '',
        size: attachments[index]?.size || 0,
        url: att.url
      })),
    });

    const { data, error } = await supabase
      .from('service_records')
      .insert([serviceForDb])
      .select()
      .single();

    if (error) {
      console.error('Error creating service record:', error);
      throw new Error(`Failed to create service record: ${error.message}`);
    }

    console.log('Service record created successfully:', data);
    return mapSupabaseServiceRecordToServiceRecord(data);
  } catch (error) {
    console.error('Error in createServiceRecord:', error);
    throw error;
  }
};

export const updateServiceRecord = async (
  id: string, 
  serviceData: Partial<ServiceRecord>, 
  newImages: File[] = [], 
  newAttachments: File[] = []
): Promise<ServiceRecord> => {
  try {
    console.log('Updating service record with new files:', { newImages: newImages.length, newAttachments: newAttachments.length });
    
    // Get current service record data
    const { data: currentRecord, error: fetchError } = await supabase
      .from('service_records')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch current service record: ${fetchError.message}`);
    }

    // Upload new files
    const uploadedImages = newImages.length > 0 ? await uploadMultipleFiles(newImages, 'service-records/images') : [];
    const uploadedAttachments = newAttachments.length > 0 ? await uploadMultipleFiles(newAttachments, 'service-records/attachments') : [];

    console.log('New files uploaded:', { uploadedImages, uploadedAttachments });

    // Combine existing and new files
    const existingImages: string[] = Array.isArray(currentRecord.images) 
      ? (currentRecord.images as string[])
      : [];
        
    const existingAttachments = Array.isArray(currentRecord.attachments) 
      ? (currentRecord.attachments as Array<{name: string; type: string; size: number; url: string}>)
      : [];
    
    const allImages: string[] = [...existingImages, ...uploadedImages.map(img => img.url)];
    const allAttachments: Array<{name: string; type: string; size: number; url: string}> = [
      ...existingAttachments,
      ...uploadedAttachments.map((att, index) => ({
        name: newAttachments[index]?.name || '',
        type: newAttachments[index]?.type || '',
        size: newAttachments[index]?.size || 0,
        url: att.url
      }))
    ];

    const serviceForDb = mapServiceRecordToSupabaseServiceRecord({
      ...serviceData,
      images: allImages,
      attachments: allAttachments,
    });

    const { data, error } = await supabase
      .from('service_records')
      .update(serviceForDb)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service record:', error);
      throw new Error(`Failed to update service record: ${error.message}`);
    }

    console.log('Service record updated successfully:', data);
    return mapSupabaseServiceRecordToServiceRecord(data);
  } catch (error) {
    console.error('Error in updateServiceRecord:', error);
    throw error;
  }
};

export const getAllServiceRecords = async (): Promise<ServiceRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('service_records')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching service records:', error);
      throw new Error(`Failed to fetch service records: ${error.message}`);
    }

    return data.map(mapSupabaseServiceRecordToServiceRecord);
  } catch (error) {
    console.error('Error in getAllServiceRecords:', error);
    throw error;
  }
};

export const deleteServiceRecord = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('service_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting service record:', error);
      throw new Error(`Failed to delete service record: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteServiceRecord:', error);
    throw error;
  }
};
