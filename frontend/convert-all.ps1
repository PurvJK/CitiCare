
$frontendSrc = "c:\Users\ayush\OneDrive\Desktop\citi\CitiCare-dev\frontend\src"
$converted = 0
$errors = 0

Write-Host "Starting TypeScript to JavaScript conversion..." -ForegroundColor Cyan
Write-Host "Processing $((Get-ChildItem -Path $frontendSrc -Include '*.tsx' -Recurse).Count) files..."

Get-ChildItem -Path $frontendSrc -Include "*.tsx" -Recurse | ForEach-Object {
    $tsxFile = $_.FullName
    $jsxFile = $tsxFile -replace '\.tsx$', '.jsx'
    $fileName = Split-Path $tsxFile -Leaf
    
    try {
        # Read content
        [string]$content = Get-Content $tsxFile -Raw -ErrorAction Stop
        
        # --- TYPESCRIPT SYNTAX REMOVAL ---
        
        # 1. Remove type keyword from imports
        $content = $content -replace 'import\s+{\s*type\s+', 'import { '
        $content = $content -replace ',\s*type\s+(\w+)', ', $1'
        $content = $content -replace 'import\s+type\s+', 'import '
        
        # 2. Remove interface definitions
        $content = $content -replace 'export\s+interface\s+\w+\s*\{[^}]*?\n\}\s*\n*', ''
        $content = $content -replace 'interface\s+\w+\s*\{[^}]*?\n\}\s*\n*', ''
        
        # 3. Remove type declarations
        $content = $content -replace 'export\s+type\s+\w+\s*=\s*[^;]+;\s*', ''
        $content = $content -replace 'type\s+\w+\s*=\s*[^;]+;\s*', ''
        $content = $content -replace 'type\s+\w+\s*\{[^}]*?\n\}\s*', ''
        
        # 4. Remove generic type parameters from common functions
        $content = $content -replace 'useState\s*<[^>]*?>\s*\(', 'useState('
        $content = $content -replace 'useRef\s*<[^>]*?>\s*\(', 'useRef('
        $content = $content -replace 'useReducer\s*<[^>]*?>\s*\(', 'useReducer('
        $content = $content -replace 'useCallback\s*<[^>]*?>\s*\(', 'useCallback('
        $content = $content -replace 'useContext\s*<[^>]*?>\s*\(', 'useContext('
        $content = $content -replace 'useMemo\s*<[^>]*?>\s*\(', 'useMemo('
        
        # 5. Remove React-specific generics
        $content = $content -replace 'React\.forwardRef\s*<[^>]*?>\s*\(', 'React.forwardRef('
        $content = $content -replace 'React\.FC\s*<[^>]*?>', 'React.FC'
        $content = $content -replace 'React\.ComponentType\s*<[^>]*?>', 'React.ComponentType'
        
        # 6. Remove type annotations from parameters and variables
        # Pattern: name: Type followed by comma, closing paren, or equals
        $content = $content -replace '\b(\w+)\s*:\s*([a-zA-Z_<>[\]\s|&]+?)\s*([,)=])', '$1$3'
        $content = $content -replace '\b(\w+)\s*:\s*([a-zA-Z_<>[\]\s|&]+?)\s*;', '$1;'
        
        # 7. Remove as Type casts
        $content = $content -replace '\s+as\s+[a-zA-Z_<>[\]\s.]+(?=\s|[,;)\]])', ''
        $content = $content -replace '\s+as\s+const\b', ''
        
        # 8. Remove remaining generic angle brackets (for functions and types)
        $content = $content -replace '<\s*\w+[\s|&,<>]*\s*>', ''
        
        # 9. Remove Record<K,V> pattern
        $content = $content -replace 'Record\s*<[^>]*>\s*', '[key: string]: any'
        
        # 10. Clean up double spaces and excessive whitespace
        $content = $content -replace '(?m)^\s+$', ''  # Remove blank lines with spaces
        $content = $content -replace '  +', ' '       # Multiple spaces to single
        
        # Write converted file
        $null = Set-Content -Path $jsxFile -Value $content -Encoding UTF8 -ErrorAction Stop
        
        # Delete original TSX file
        $null = Remove-Item -Path $tsxFile -Force -ErrorAction Stop
        
        $converted++
        Write-Host "✓ $fileName" -ForegroundColor Green
    }
    catch {
        $errors++
        Write-Host "✗ $fileName : $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== CONVERSION COMPLETE ===" -ForegroundColor Cyan
Write-Host "Converted: $converted files" -ForegroundColor Green
Write-Host "Errors: $errors files" -ForegroundColor $(if ($errors -gt 0) { 'Red' } else { 'Green' })

# Verify results
$tsx_remaining = (Get-ChildItem -Path $frontendSrc -Include "*.tsx" -Recurse).Count
$jsx_total = (Get-ChildItem -Path $frontendSrc -Include "*.jsx" -Recurse).Count
Write-Host ""
Write-Host "Verification:"
Write-Host "  TSX files remaining: $tsx_remaining (should be 1 - vite-env.d.ts)"
Write-Host "  JSX files total: $jsx_total"
