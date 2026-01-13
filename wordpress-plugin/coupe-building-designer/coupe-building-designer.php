<?php
/**
 * Plugin Name: Coupe Building Designer
 * Plugin URI: https://coupebuildingco.com
 * Description: A 3D Building Designer with floor plans and real-time pricing.
 * Version: 1.0.0
 * Author: Coupe Building Co.
 * Author URI: https://coupebuildingco.com
 * License: GPL2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// Define plugin paths
define( 'COUPE_DESIGNER_PATH', plugin_dir_path( __FILE__ ) );
define( 'COUPE_DESIGNER_URL', plugin_dir_url( __FILE__ ) );

/**
 * Enqueue Scripts and Styles
 */
function coupe_designer_enqueue_scripts() {
	// Only load on pages with the shortcode to improve performance
	global $post;
	if ( is_a( $post, 'WP_Post' ) && has_shortcode( $post->post_content, 'coupe_designer' ) ) {

		// CSS
		wp_enqueue_style( 'coupe-designer-css', COUPE_DESIGNER_URL . 'assets/css/style.css', array(), '1.0.0' );

		// Tailwind (using CDN for simplicity in this migration, consider compiling for production)
		// Note: A full build step would compile Tailwind. For now, we'll try to use a standard CSS file 
		// or if you prefer a CDN for development:
		// wp_enqueue_script( 'tailwind-cdn', 'https://cdn.tailwindcss.com', array(), '3.4.0', false );
		// However, it's safer to just write standard CSS or compile the existing Tailwind. 
		// We will assume 'assets/css/style.css' will contain the necessary styles.

		// External Libraries
		// Three.js
		wp_enqueue_script( 'three-js', 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', array(), '0.128.0', true );
		// Three.js Addons (OrbitControls, etc. - might need to bundle these if not easily available via simple CDN link without module issues)
		// For simplicity in a WP plugin without a bundler, we might need a bundle or specific script tags.
		// We'll trust the migration to handle the imports or use a global Three object.
		
		// GoJS
		wp_enqueue_script( 'go-js', 'https://unpkg.com/gojs/release/go.js', array(), '2.3.0', true );

		// Custom Scripts
		
    wp_enqueue_script( 'coupe-pricing', COUPE_DESIGNER_URL . 'assets/js/pricing.js', array(), '1.0', true );
    wp_enqueue_script( 'coupe-data', COUPE_DESIGNER_URL . 'assets/js/data.js', array(), '1.0', true );
    wp_enqueue_script( 'coupe-building-3d', COUPE_DESIGNER_URL . 'assets/js/building-3d.js', array('three-js', 'three-orbit', 'three-sky', 'coupe-data'), '1.0', true );
    wp_enqueue_script( 'coupe-floor-plan', COUPE_DESIGNER_URL . 'assets/js/floor-plan.js', array('go-js', 'coupe-data'), '1.0', true );
    wp_enqueue_script( 'coupe-app', COUPE_DESIGNER_URL . 'assets/js/app.js', array('jquery', 'coupe-building-3d', 'coupe-floor-plan', 'coupe-pricing', 'coupe-data'), '1.0', true );


		// Pass PHP variables to JS
		wp_localize_script( 'coupe-app', 'coupeDesignerData', array(
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
			'nonce'   => wp_create_nonce( 'coupe_designer_nonce' ),
		));
	}
}
add_action( 'wp_enqueue_scripts', 'coupe_designer_enqueue_scripts' );

/**
 * Warning for ES Modules with Three.js
 * 
 * Standard Three.js examples often use ES modules (import ...). 
 * WordPress standard enqueueing simply adds script tags.
 * We will write our JS files to check for the global `THREE` object.
 * Detailed 3D features like OrbitControls often reside in 'examples/jsm/' (modules).
 * If we need them, we might need to enqueue the non-module versions from 'examples/js/' if available, 
 * or rewrite the JS to use dynamic imports if the browser supports it. 
 * For this migration, we will attempt to use the global THREE variable and ensure we have OrbitControls available.
 * 
 * Let's add OrbitControls from a CDN that exposes it globally if possible, or we will bundle it.
 * Adding a script for OrbitControls that works with global THREE.
 */
function coupe_designer_add_orbit_controls() {
    global $post;
	if ( is_a( $post, 'WP_Post' ) && has_shortcode( $post->post_content, 'coupe_designer' ) ) {
        // Enqueue OrbitControls (non-module version if findable, otherwise we might have to use module)
         wp_enqueue_script( 'three-orbit-controls', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', array('three-js'), '0.128.0', true );
         // Enqueue GLTFLoader/OBJLoader if needed. The current code uses OBJLoader and Sky.
         wp_enqueue_script( 'three-sky', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/objects/Sky.js', array('three-js'), '0.128.0', true );
    }
}
add_action( 'wp_enqueue_scripts', 'coupe_designer_add_orbit_controls', 11 );


/**
 * Shortcode Output
 */
function coupe_designer_shortcode() {
	ob_start();
	include COUPE_DESIGNER_PATH . 'templates/interface.php';
	return ob_get_clean();
}

add_shortcode( 'coupe_designer', 'coupe_designer_shortcode' );

/**
 * AJAX Handler for Quote Submission
 */
function coupe_submit_quote() {
    check_ajax_referer( 'coupe_designer_nonce', 'security' );

    $design = isset($_POST['design']) ? $_POST['design'] : array();
    $client = isset($_POST['client']) ? $_POST['client'] : array();

    $name = sanitize_text_field( $client['name'] );
    $address = sanitize_text_field( $client['address'] );
    
    // Format Email Body
    $message = "New Building Quote Request\n\n";
    $message .= "Client: $name\n";
    $message .= "Address: $address\n\n";
    $message .= "Specifications:\n";
    $message .= "Size: " . sanitize_text_field($design['width']) . "' x " . sanitize_text_field($design['length']) . "'\n";
    $message .= "Use: " . sanitize_text_field($design['buildingUse']) . "\n";
    $message .= "Colors: Wall(" . sanitize_text_field($design['wallColor']) . "), Roof(" . sanitize_text_field($design['roofColor']) . "), Trim(" . sanitize_text_field($design['trimColor']) . ")\n";
    
    // Send Email
    $to = get_option( 'admin_email' ); // Send to admin for now, or configured email
    $subject = "New Quote Request from $name";
    $headers = array('Content-Type: text/plain; charset=UTF-8');
    
    $sent = wp_mail( $to, $subject, $message, $headers );

    if ( $sent ) {
        wp_send_json_success( array( 'message' => 'Quote sent successfully!' ) );
    } else {
        wp_send_json_error( array( 'message' => 'Failed to send email.' ) );
    }
}
add_action( 'wp_ajax_coupe_submit_quote', 'coupe_submit_quote' );
add_action( 'wp_ajax_nopriv_coupe_submit_quote', 'coupe_submit_quote' );

