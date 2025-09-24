<?php
/**
 * Plugin Name: WPGraphQL Expose Related Options
 * Description: Adds a GraphQL field `relatedOptions` to Product which reads `_related_options` post meta and returns an array of DB IDs (integers).
 * Version: 0.1.0
 * Author: Generated Snippet
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('graphql_register_types', function() {
    // Only register if function exists
    if (!function_exists('register_graphql_field')) return;

    register_graphql_field('Product', 'relatedOptions', [
        'type' => ['list_of' => 'Int'],
        'description' => 'Related product database IDs read from _related_options post meta.',
        // Optional: Use 'auth_callback' to restrict who can read this field.
        // 'auth_callback' => function() { return current_user_can('edit_posts'); },
        'resolve' => function($product, $args, $context, $info) {
            $post_id = null;
            if (is_object($product) && property_exists($product, 'ID')) {
                $post_id = $product->ID;
            } elseif (is_array($product) && isset($product['databaseId'])) {
                // WPGraphQL may pass an array with databaseId
                $post_id = intval($product['databaseId']);
            } elseif (isset($product->databaseId)) {
                $post_id = intval($product->databaseId);
            }

            if (!$post_id) return null;

            $raw = get_post_meta($post_id, '_related_options', true);
            if ($raw === null || $raw === '') return null;

            // If it's an array already (unlikely for underscore meta), normalize
            if (is_array($raw)) {
                return array_map('intval', $raw);
            }

            // If stored as JSON string (e.g., "[\"433\",\"439\"]")
            if (is_string($raw)) {
                $trimmed = trim($raw);
                // Try JSON first
                $decoded = json_decode($trimmed, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    return array_values(array_map('intval', $decoded));
                }

                // Fallback: comma-separated numbers
                $parts = array_filter(array_map('trim', explode(',', $trimmed)), function($v) { return $v !== ''; });
                if (count($parts) > 0) {
                    return array_values(array_map('intval', $parts));
                }
            }

            // If numeric
            if (is_numeric($raw)) {
                return [intval($raw)];
            }

            return null;
        }
    ]);
});
