// 3D UI Effects & Interactivity
// Handles Tilt.js initialization and custom 3D hover states

document.addEventListener('DOMContentLoaded', () => {
    
    // Check if VanillaTilt is loaded
    if (typeof VanillaTilt === 'undefined') {
        console.warn('VanillaTilt.js not loaded');
        return;
    }

    // --- 1. Apply Tilt to Sidebar ---
    VanillaTilt.init(document.querySelector('.sidebar'), {
        max: 5,               // Subtle tilt for large element
        speed: 400,
        glare: true,
        "max-glare": 0.2,
        scale: 1.01
    });

    // --- 2. Apply Tilt to Service Items (What I Do) ---
    // These can have a stronger effect
    VanillaTilt.init(document.querySelectorAll('.service-item'), {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.4,
        scale: 1.05
    });

    // --- 3. Apply Tilt to Project Items ---
    VanillaTilt.init(document.querySelectorAll('.project-item'), {
        max: 10,
        speed: 400,
        glare: true,
        "max-glare": 0.3,
        scale: 1.02
    });

    // --- 4. Apply Tilt to Testimonial Cards ---
    VanillaTilt.init(document.querySelectorAll('.testimonial-card'), {
        max: 12,
        speed: 400,
        glare: true,
        "max-glare": 0.3
    });

    // --- 5. Apply Tilt to Client Logos ---
    VanillaTilt.init(document.querySelectorAll('.client-logo-container'), {
        max: 20,
        speed: 400,
        scale: 1.1,
        glare: true,
        "max-glare": 0.5
    });


    // --- Custom Interactive Cursor Logic (Optional Polish) ---
    // Make elements "magnetic" or react to cursor distance?
    // For now, let's stick to the tilt as the primary 3D driver.
});
