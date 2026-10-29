<?php
// Direct Apache fallback to serve unified build
$outIndex = __DIR__ . '/out/index.html';
if (file_exists($outIndex)) {
    readfile($outIndex);
    exit;
}
echo "Hope build not found. Run 'npm run build' to generate the build.";
