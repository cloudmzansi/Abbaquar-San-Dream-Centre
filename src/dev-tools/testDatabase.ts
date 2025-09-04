import { supabase } from '@/lib/supabase';

export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Check if we can connect
    const { data, error } = await supabase.from('contact_messages').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Database connection failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Database connection successful');
    console.log('Current message count:', data?.length || 0);
    
    // Test 2: Try to insert a test message
    const testMessage = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Database Test',
      message: 'This is a test message to verify database functionality',
      status: 'new'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('contact_messages')
      .insert(testMessage)
      .select();
    
    if (insertError) {
      console.error('Insert test failed:', insertError);
      return { success: false, error: insertError.message };
    }
    
    console.log('Insert test successful:', insertData);
    
    // Test 3: Clean up test message
    if (insertData && insertData[0]) {
      await supabase
        .from('contact_messages')
        .delete()
        .eq('id', insertData[0].id);
      console.log('Test message cleaned up');
    }
    
    return { success: true, message: 'Database connection and operations working correctly' };
    
  } catch (error) {
    console.error('Database test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}; 