/**
 * List all available Gemini models for this API key
 */

require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function listModels() {
  console.log('📋 Listing all available Gemini models...\n');

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not configured');
    process.exit(1);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // List available models
    const models = await ai.models.list();

    console.log(`✅ Found ${models.length} models:\n`);

    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      if (model.displayName) {
        console.log(`   Display: ${model.displayName}`);
      }
      if (model.description) {
        console.log(`   Description: ${model.description}`);
      }
      if (model.inputTokenLimit) {
        console.log(`   Input tokens: ${model.inputTokenLimit}`);
      }
      if (model.outputTokenLimit) {
        console.log(`   Output tokens: ${model.outputTokenLimit}`);
      }
      if (model.supportedGenerationMethods) {
        console.log(`   Methods: ${model.supportedGenerationMethods.join(', ')}`);
      }
      console.log('');
    });

    // Check specifically for Gemini 3
    const gemini3Models = models.filter(m => m.name.includes('gemini-3') || m.name.includes('gemini3'));

    if (gemini3Models.length > 0) {
      console.log('\n🎯 Gemini 3 models found:');
      gemini3Models.forEach(m => console.log(`   - ${m.name}`));
    } else {
      console.log('\n⚠️  No Gemini 3 models found');
      console.log('   This may mean:');
      console.log('   - Your API key doesn\'t have access yet');
      console.log('   - Billing needs to be enabled');
      console.log('   - The model requires special access');
    }

  } catch (error) {
    console.error('❌ Error listing models:\n');
    console.error(error.message || error);

    if (error.message && error.message.includes('401')) {
      console.error('\n💡 Invalid API key');
    } else if (error.message && error.message.includes('403')) {
      console.error('\n💡 API key lacks permissions to list models');
    }
  }
}

listModels();
