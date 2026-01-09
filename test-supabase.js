import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually to avoid dependencies
const envPath = path.join(__dirname, '.env');
let supabaseUrl = '';
let supabaseKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        if (line.startsWith('VITE_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].trim();
        }
        if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
            supabaseKey = line.split('=')[1].trim();
        }
    });
} catch (err) {
    console.error('Error reading .env file:', err.message);
    process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        // 1. Test Read
        console.log('\n1. Testing Read Access...');
        const { data: readData, error: readError } = await supabase
            .from('invoices')
            .select('count', { count: 'exact', head: true });

        if (readError) {
            console.error('Read Error:', readError.message);
            if (readError.code === 'PGRST301') console.error('Hint: JWT expired or invalid tables');
            if (readError.message.includes('relation "public.invoices" does not exist')) {
                console.error('CRITICAL: Table "invoices" does not exist.');
            }
        } else {
            console.log('Read Success! Row count:', readData);
        }

        // 2. Test Insert
        console.log('\n2. Testing Insert Access...');
        const testInvoice = {
            invoice_number: 'TEST-' + Date.now(),
            buyer_name: 'Test Buyer',
            invoice_date: new Date().toISOString(),
            total_amount: 100.00,
            form_data: { test: true },
            items: []
        };

        const { data: insertData, error: insertError } = await supabase
            .from('invoices')
            .insert([testInvoice])
            .select();

        if (insertError) {
            console.error('Insert Error:', insertError);
            console.error('Message:', insertError.message);
        } else {
            console.log('Insert Success!', insertData);

            // Cleanup
            if (insertData && insertData[0] && insertData[0].id) {
                console.log('\n3. Cleaning up test data...');
                const { error: deleteError } = await supabase
                    .from('invoices')
                    .delete()
                    .eq('id', insertData[0].id);

                if (deleteError) console.error('Cleanup Error (Expected if delete policy is auth-only):', deleteError.message);
                else console.log('Cleanup Success!');
            }
        }

    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

testConnection();
