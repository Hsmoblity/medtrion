<?php
/**
 * Plugin Name: HSM Stripe Webhook Processor
 * Plugin URI: https://medtrion.ca
 * Description: Custom WordPress plugin for processing Stripe webhook events and synchronizing data with WooCommerce.
 * Version: 1.0.0
 * Author: Medtrion Team
 * License: GPL v2 or later
 * Text Domain: hsm-stripe-webhook
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('HSM_STRIPE_WEBHOOK_VERSION', '1.0.0');
define('HSM_STRIPE_WEBHOOK_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('HSM_STRIPE_WEBHOOK_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main plugin class
 */
class HSM_Stripe_Webhook_Processor {
    
    /**
     * Plugin instance
     */
    private static $instance = null;
    
    /**
     * Get plugin instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        add_action('init', array($this, 'init'));
        add_action('plugins_loaded', array($this, 'load_textdomain'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    /**
     * Initialize plugin
     */
    public function init() {
        // Load required files
        $this->load_dependencies();
        
        // Initialize components
        $this->init_components();
        
        // Register hooks
        $this->register_hooks();
    }
    
    /**
     * Load plugin dependencies
     */
    private function load_dependencies() {
        require_once HSM_STRIPE_WEBHOOK_PLUGIN_DIR . 'includes/class-webhook-processor.php';
        require_once HSM_STRIPE_WEBHOOK_PLUGIN_DIR . 'includes/class-stripe-handler.php';
        require_once HSM_STRIPE_WEBHOOK_PLUGIN_DIR . 'includes/class-order-sync.php';
        require_once HSM_STRIPE_WEBHOOK_PLUGIN_DIR . 'includes/class-customer-sync.php';
        require_once HSM_STRIPE_WEBHOOK_PLUGIN_DIR . 'includes/class-inventory-sync.php';
        require_once HSM_STRIPE_WEBHOOK_PLUGIN_DIR . 'admin/class-admin-settings.php';
        require_once HSM_STRIPE_WEBHOOK_PLUGIN_DIR . 'api/class-webhook-endpoints.php';
        require_once HSM_STRIPE_WEBHOOK_PLUGIN_DIR . 'api/class-graphql-mutations.php';
        require_once HSM_STRIPE_WEBHOOK_PLUGIN_DIR . 'database/class-database-schema.php';
        require_once HSM_STRIPE_WEBHOOK_PLUGIN_DIR . 'database/class-webhook-logs.php';
    }
    
    /**
     * Initialize components
     */
    private function init_components() {
        // Initialize admin settings
        if (is_admin()) {
            new HSM_Stripe_Webhook_Admin_Settings();
        }
        
        // Initialize webhook endpoints
        new HSM_Stripe_Webhook_Endpoints();
        
        // Initialize GraphQL mutations
        new HSM_Stripe_Webhook_GraphQL_Mutations();
    }
    
    /**
     * Register hooks
     */
    private function register_hooks() {
        // Add custom REST API endpoints
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // Add GraphQL mutations
        add_action('graphql_register_types', array($this, 'register_graphql_mutations'));
        
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
    }
    
    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        register_rest_route('hsm-stripe/v1', '/webhook', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_webhook'),
            'permission_callback' => array($this, 'webhook_permission_check'),
        ));
        
        register_rest_route('hsm-stripe/v1', '/test-webhook', array(
            'methods' => 'POST',
            'callback' => array($this, 'test_webhook'),
            'permission_callback' => array($this, 'admin_permission_check'),
        ));
    }
    
    /**
     * Register GraphQL mutations
     */
    public function register_graphql_mutations() {
        // Register custom GraphQL mutations for Stripe integration
        register_graphql_mutation('updateOrderStatus', array(
            'inputFields' => array(
                'orderId' => array(
                    'type' => 'Int',
                    'description' => 'Order ID',
                ),
                'status' => array(
                    'type' => 'String',
                    'description' => 'Order status',
                ),
                'paymentStatus' => array(
                    'type' => 'String',
                    'description' => 'Payment status',
                ),
                'paymentIntentId' => array(
                    'type' => 'String',
                    'description' => 'Stripe payment intent ID',
                ),
                'metadata' => array(
                    'type' => 'String',
                    'description' => 'Additional metadata',
                ),
            ),
            'outputFields' => array(
                'success' => array(
                    'type' => 'Boolean',
                    'description' => 'Success status',
                ),
                'message' => array(
                    'type' => 'String',
                    'description' => 'Response message',
                ),
                'order' => array(
                    'type' => 'Order',
                    'description' => 'Updated order',
                ),
            ),
            'mutateAndGetPayload' => array($this, 'update_order_status_mutation'),
        ));
    }
    
    /**
     * Handle webhook requests
     */
    public function handle_webhook($request) {
        $webhook_processor = new HSM_Stripe_Webhook_Processor_Class();
        return $webhook_processor->process_webhook($request);
    }
    
    /**
     * Test webhook functionality
     */
    public function test_webhook($request) {
        $webhook_processor = new HSM_Stripe_Webhook_Processor_Class();
        return $webhook_processor->test_webhook($request);
    }
    
    /**
     * Update order status GraphQL mutation
     */
    public function update_order_status_mutation($input) {
        $order_sync = new HSM_Stripe_Order_Sync();
        return $order_sync->update_order_status($input);
    }
    
    /**
     * Webhook permission check
     */
    public function webhook_permission_check($request) {
        // Verify webhook signature
        $signature = $request->get_header('X-Stripe-Signature');
        $payload = $request->get_body();
        $secret = get_option('hsm_stripe_webhook_secret');
        
        if (!$this->verify_webhook_signature($payload, $signature, $secret)) {
            return new WP_Error('invalid_signature', 'Invalid webhook signature', array('status' => 401));
        }
        
        return true;
    }
    
    /**
     * Admin permission check
     */
    public function admin_permission_check($request) {
        return current_user_can('manage_options');
    }
    
    /**
     * Verify webhook signature
     */
    private function verify_webhook_signature($payload, $signature, $secret) {
        $expected_signature = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expected_signature, $signature);
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            'HSM Stripe Webhook',
            'HSM Stripe Webhook',
            'manage_options',
            'hsm-stripe-webhook',
            array($this, 'admin_page')
        );
    }
    
    /**
     * Admin page
     */
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>HSM Stripe Webhook Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('hsm_stripe_webhook_settings');
                do_settings_sections('hsm_stripe_webhook_settings');
                submit_button();
                ?>
            </form>
            
            <h2>Webhook Status</h2>
            <div id="webhook-status">
                <?php $this->display_webhook_status(); ?>
            </div>
            
            <h2>Recent Events</h2>
            <div id="recent-events">
                <?php $this->display_recent_events(); ?>
            </div>
        </div>
        <?php
    }
    
    /**
     * Display webhook status
     */
    private function display_webhook_status() {
        $webhook_logs = new HSM_Stripe_Webhook_Logs();
        $status = $webhook_logs->get_webhook_status();
        
        echo '<div class="webhook-status">';
        echo '<p><strong>Status:</strong> ' . ($status['active'] ? 'Active' : 'Inactive') . '</p>';
        echo '<p><strong>Last Event:</strong> ' . $status['last_event'] . '</p>';
        echo '<p><strong>Success Rate:</strong> ' . $status['success_rate'] . '%</p>';
        echo '</div>';
    }
    
    /**
     * Display recent events
     */
    private function display_recent_events() {
        $webhook_logs = new HSM_Stripe_Webhook_Logs();
        $events = $webhook_logs->get_recent_events(10);
        
        echo '<table class="wp-list-table widefat fixed striped">';
        echo '<thead><tr><th>Event ID</th><th>Type</th><th>Status</th><th>Processed At</th></tr></thead>';
        echo '<tbody>';
        
        foreach ($events as $event) {
            echo '<tr>';
            echo '<td>' . esc_html($event['event_id']) . '</td>';
            echo '<td>' . esc_html($event['event_type']) . '</td>';
            echo '<td>' . esc_html($event['status']) . '</td>';
            echo '<td>' . esc_html($event['processed_at']) . '</td>';
            echo '</tr>';
        }
        
        echo '</tbody></table>';
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Create database tables
        $database_schema = new HSM_Stripe_Database_Schema();
        $database_schema->create_tables();
        
        // Set default options
        add_option('hsm_stripe_webhook_secret', '');
        add_option('hsm_stripe_api_key', '');
        add_option('hsm_stripe_webhook_active', true);
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Load plugin textdomain
     */
    public function load_textdomain() {
        load_plugin_textdomain('hsm-stripe-webhook', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
}

// Initialize plugin
HSM_Stripe_Webhook_Processor::get_instance();

/**
 * Webhook Processor Class
 */
class HSM_Stripe_Webhook_Processor_Class {
    
    /**
     * Process webhook request
     */
    public function process_webhook($request) {
        $payload = json_decode($request->get_body(), true);
        $event_type = $payload['type'] ?? '';
        $event_id = $payload['id'] ?? '';
        
        // Log webhook event
        $webhook_logs = new HSM_Stripe_Webhook_Logs();
        $log_id = $webhook_logs->log_event($event_id, $event_type, 'processing');
        
        try {
            // Process different event types
            switch ($event_type) {
                case 'payment_intent.succeeded':
                    $this->handle_payment_intent_succeeded($payload['data']['object']);
                    break;
                    
                case 'payment_intent.payment_failed':
                    $this->handle_payment_intent_failed($payload['data']['object']);
                    break;
                    
                case 'checkout.session.completed':
                    $this->handle_checkout_session_completed($payload['data']['object']);
                    break;
                    
                case 'charge.dispute.created':
                    $this->handle_charge_dispute_created($payload['data']['object']);
                    break;
                    
                default:
                    error_log("Unhandled Stripe webhook event: {$event_type}");
                    break;
            }
            
            // Update log status
            $webhook_logs->update_log_status($log_id, 'success');
            
            return new WP_REST_Response(array(
                'success' => true,
                'message' => 'Webhook processed successfully',
                'event_id' => $event_id
            ), 200);
            
        } catch (Exception $e) {
            // Update log status with error
            $webhook_logs->update_log_status($log_id, 'failed', $e->getMessage());
            
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Webhook processing failed',
                'error' => $e->getMessage()
            ), 500);
        }
    }
    
    /**
     * Handle payment intent succeeded
     */
    private function handle_payment_intent_succeeded($payment_intent) {
        $order_sync = new HSM_Stripe_Order_Sync();
        $order_sync->update_payment_status($payment_intent);
    }
    
    /**
     * Handle payment intent failed
     */
    private function handle_payment_intent_failed($payment_intent) {
        $order_sync = new HSM_Stripe_Order_Sync();
        $order_sync->handle_payment_failure($payment_intent);
    }
    
    /**
     * Handle checkout session completed
     */
    private function handle_checkout_session_completed($session) {
        $order_sync = new HSM_Stripe_Order_Sync();
        $order_sync->process_checkout_completion($session);
    }
    
    /**
     * Handle charge dispute created
     */
    private function handle_charge_dispute_created($dispute) {
        $order_sync = new HSM_Stripe_Order_Sync();
        $order_sync->handle_dispute($dispute);
    }
    
    /**
     * Test webhook functionality
     */
    public function test_webhook($request) {
        $test_data = array(
            'type' => 'test.event',
            'id' => 'test_' . time(),
            'data' => array(
                'object' => array(
                    'id' => 'test_payment_intent',
                    'status' => 'succeeded',
                    'amount' => 1000,
                    'currency' => 'cad'
                )
            )
        );
        
        $request->set_body(json_encode($test_data));
        return $this->process_webhook($request);
    }
}

/**
 * Order Sync Class
 */
class HSM_Stripe_Order_Sync {
    
    /**
     * Update payment status
     */
    public function update_payment_status($payment_intent) {
        $order_id = $this->get_order_id_by_payment_intent($payment_intent['id']);
        
        if ($order_id) {
            // Update order meta
            update_post_meta($order_id, 'stripe_payment_intent_id', $payment_intent['id']);
            update_post_meta($order_id, 'payment_status', 'paid');
            update_post_meta($order_id, 'webhook_processed_at', current_time('mysql'));
            
            // Update order status
            $order = wc_get_order($order_id);
            if ($order) {
                $order->set_status('processing');
                $order->save();
            }
        }
    }
    
    /**
     * Handle payment failure
     */
    public function handle_payment_failure($payment_intent) {
        $order_id = $this->get_order_id_by_payment_intent($payment_intent['id']);
        
        if ($order_id) {
            // Update order meta
            update_post_meta($order_id, 'payment_status', 'failed');
            update_post_meta($order_id, 'failure_reason', $payment_intent['last_payment_error']['message'] ?? 'Payment failed');
            
            // Update order status
            $order = wc_get_order($order_id);
            if ($order) {
                $order->set_status('failed');
                $order->save();
            }
        }
    }
    
    /**
     * Process checkout completion
     */
    public function process_checkout_completion($session) {
        $order_id = $this->get_order_id_by_session($session['id']);
        
        if ($order_id) {
            // Update order with session data
            update_post_meta($order_id, 'stripe_session_id', $session['id']);
            update_post_meta($order_id, 'stripe_customer_id', $session['customer']);
            update_post_meta($order_id, 'payment_status', 'paid');
            
            // Update order status
            $order = wc_get_order($order_id);
            if ($order) {
                $order->set_status('processing');
                $order->save();
            }
        }
    }
    
    /**
     * Handle dispute
     */
    public function handle_dispute($dispute) {
        $order_id = $this->get_order_id_by_charge($dispute['charge']);
        
        if ($order_id) {
            // Update order meta
            update_post_meta($order_id, 'dispute_status', 'open');
            update_post_meta($order_id, 'dispute_id', $dispute['id']);
            update_post_meta($order_id, 'dispute_reason', $dispute['reason']);
            
            // Update order status
            $order = wc_get_order($order_id);
            if ($order) {
                $order->set_status('disputed');
                $order->save();
            }
        }
    }
    
    /**
     * Get order ID by payment intent
     */
    private function get_order_id_by_payment_intent($payment_intent_id) {
        global $wpdb;
        
        $order_id = $wpdb->get_var($wpdb->prepare(
            "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = 'stripe_payment_intent_id' AND meta_value = %s",
            $payment_intent_id
        ));
        
        return $order_id;
    }
    
    /**
     * Get order ID by session
     */
    private function get_order_id_by_session($session_id) {
        global $wpdb;
        
        $order_id = $wpdb->get_var($wpdb->prepare(
            "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = 'stripe_session_id' AND meta_value = %s",
            $session_id
        ));
        
        return $order_id;
    }
    
    /**
     * Get order ID by charge
     */
    private function get_order_id_by_charge($charge_id) {
        global $wpdb;
        
        $order_id = $wpdb->get_var($wpdb->prepare(
            "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = 'stripe_charge_id' AND meta_value = %s",
            $charge_id
        ));
        
        return $order_id;
    }
}

/**
 * Webhook Logs Class
 */
class HSM_Stripe_Webhook_Logs {
    
    /**
     * Log webhook event
     */
    public function log_event($event_id, $event_type, $status) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'stripe_webhook_logs';
        
        $result = $wpdb->insert(
            $table_name,
            array(
                'event_id' => $event_id,
                'event_type' => $event_type,
                'status' => $status,
                'processed_at' => current_time('mysql'),
                'created_at' => current_time('mysql')
            ),
            array('%s', '%s', '%s', '%s', '%s')
        );
        
        return $wpdb->insert_id;
    }
    
    /**
     * Update log status
     */
    public function update_log_status($log_id, $status, $error_message = null) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'stripe_webhook_logs';
        
        $data = array(
            'status' => $status,
            'updated_at' => current_time('mysql')
        );
        
        if ($error_message) {
            $data['error_message'] = $error_message;
        }
        
        $wpdb->update(
            $table_name,
            $data,
            array('id' => $log_id),
            array('%s', '%s', '%s'),
            array('%d')
        );
    }
    
    /**
     * Get webhook status
     */
    public function get_webhook_status() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'stripe_webhook_logs';
        
        $status = $wpdb->get_row($wpdb->prepare(
            "SELECT 
                COUNT(*) as total_events,
                SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_events,
                MAX(processed_at) as last_event
            FROM {$table_name} 
            WHERE processed_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)"
        ));
        
        $success_rate = $status->total_events > 0 
            ? round(($status->successful_events / $status->total_events) * 100, 2)
            : 0;
        
        return array(
            'active' => $status->total_events > 0,
            'last_event' => $status->last_event ?: 'Never',
            'success_rate' => $success_rate
        );
    }
    
    /**
     * Get recent events
     */
    public function get_recent_events($limit = 10) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'stripe_webhook_logs';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT event_id, event_type, status, processed_at 
            FROM {$table_name} 
            ORDER BY processed_at DESC 
            LIMIT %d",
            $limit
        ), ARRAY_A);
    }
}

/**
 * Database Schema Class
 */
class HSM_Stripe_Database_Schema {
    
    /**
     * Create database tables
     */
    public function create_tables() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'stripe_webhook_logs';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE {$table_name} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            event_id VARCHAR(255) NOT NULL UNIQUE,
            event_type VARCHAR(100) NOT NULL,
            processed_at DATETIME NOT NULL,
            status ENUM('success', 'failed', 'processing') NOT NULL,
            error_message TEXT,
            retry_count INT DEFAULT 0,
            order_id INT,
            customer_id INT,
            metadata JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_event_id (event_id),
            INDEX idx_event_type (event_type),
            INDEX idx_status (status),
            INDEX idx_processed_at (processed_at)
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}
?>