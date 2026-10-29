<?php

namespace App\Models;

/**
 * Destination Model — Canonical alias of Country pointing directly to the `countries` master table.
 * Preserves 100% backward compatibility for all legacy destination imports.
 */
class Destination extends Country
{
    protected $table = 'countries';
}
