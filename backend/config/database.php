<?php

// Database consolidation: this file did not exist before (Laravel 11's slimmer
// skeleton relies on framework defaults + .env), but a custom migrations table name
// requires a published config/database.php — see CLAUDE.md "Database Consolidation"
// in the parent repo. All other values mirror the framework's own defaults so
// nothing about this app's existing DB behavior changes.
return [
    'default' => env('DB_CONNECTION', 'mysql'),

    'connections' => [
        'mysql' => [
            'driver'         => 'mysql',
            'url'            => env('DB_URL'),
            'host'           => env('DB_HOST', '127.0.0.1'),
            'port'           => env('DB_PORT', '3306'),
            'database'       => env('DB_DATABASE', 'company_system_db'),
            'username'       => env('DB_USERNAME', 'root'),
            'password'       => env('DB_PASSWORD', ''),
            'unix_socket'    => env('DB_SOCKET', ''),
            'charset'        => env('DB_CHARSET', 'utf8mb4'),
            'collation'      => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix'         => '',
            'prefix_indexes' => true,
            'strict'         => true,
            'engine'         => null,
            'options'        => extension_loaded('pdo_mysql') ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],
    ],

    // 'mockexam_migrations', not the framework default 'migrations' — this app
    // shares one physical MySQL database (company_system_db) with the Main system
    // and DTS, each of which tracks its own migration history under its own table
    // name (main_migrations / dts_migrations) so the three histories never collide.
    'migrations' => [
        'table'                  => 'mockexam_migrations',
        'update_date_on_publish' => true,
    ],
];
