import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { expectedSign, videoData } = await req.json();

    console.log('Validating Indian Sign Language (ISL) sign for:', expectedSign);

    // Valid Indian Sign Language signs in our content scope
    // Reference: ISLRTC (Indian Sign Language Research & Training Centre)
    // These signs follow ISL conventions, not ASL or other sign languages
    const validSigns = ['A', 'B', 'C', 'D', 'Hello', 'Thank You', 'Welcome'];
    
    // Enhanced mock validation for ISL testing
    // In production, this should use MediaPipe Hands or TensorFlow.js with ISL dataset
    // Datasets: Kaggle Indian Sign Language, ISLRTC, GitHub ISL gesture recognition
    const normalizedSign = expectedSign?.trim();
    const isCorrect = validSigns.includes(normalizedSign);
    
    // Simulate realistic confidence scores for ISL detection
    const confidence = isCorrect ? 0.85 + (Math.random() * 0.15) : 0.3 + (Math.random() * 0.4);
    
    // Provide helpful feedback messages for ISL learners
    let message = '';
    if (isCorrect) {
      message = 'ISL sign recognized correctly! Well done!';
    } else {
      const hints = [
        'Hand not detected clearly. Please adjust your hand position.',
        'Try holding your hand closer to the camera.',
        'Ensure good lighting for better detection.',
        'Make sure your hand is fully visible in the frame.',
      ];
      message = hints[Math.floor(Math.random() * hints.length)];
    }

    return new Response(
      JSON.stringify({ 
        isCorrect, 
        confidence: parseFloat(confidence.toFixed(2)),
        message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in validate-sign function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
