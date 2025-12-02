#!/usr/bin/env python3
"""
สคริปต์สำหรับเพิ่ม PermissionGuard ใน Dashboard Pages ทั้งหมด
"""

import re
from pathlib import Path

# Component Key Mappings
PERMISSION_MAPPINGS = {
    'accounting': {
        'kpis': 'accounting.kpis',
        'pl_statement': 'accounting.pl_statement',
        'balance_sheet': 'accounting.balance_sheet',
        'cash_flow': 'accounting.cash_flow',
        'ar_aging': 'accounting.ar_aging',
        'ap_aging': 'accounting.ap_aging',
        'revenue_breakdown': 'accounting.revenue_breakdown',
        'expense_breakdown': 'accounting.expense_breakdown',
    },
    'purchase': {
        'kpis': 'purchase.kpis',
        'trend': 'purchase.trend',
        'top_suppliers': 'purchase.top_suppliers',
        'by_category': 'purchase.by_category',
        'by_brand': 'purchase.by_brand',
        'ap_outstanding': 'purchase.ap_outstanding',
    },
    'inventory': {
        'kpis': 'inventory.kpis',
        'stock_movement': 'inventory.stock_movement',
        'low_stock': 'inventory.low_stock',
        'overstock': 'inventory.overstock',
        'slow_moving': 'inventory.slow_moving',
        'turnover': 'inventory.turnover',
        'by_branch': 'inventory.by_branch',
    },
}

def add_import(content: str) -> str:
    """เพิ่ม import PermissionGuard"""
    # ถ้ามี import อยู่แล้ว ไม่ต้องเพิ่ม
    if 'PermissionGuard' in content:
        return content

    # หา import LoadingSkeleton
    import_pattern = r"(import \{ KPICardSkeleton, ChartSkeleton, TableSkeleton \} from '@/components/LoadingSkeleton';)"
    replacement = r"\1\nimport { PermissionGuard } from '@/components/PermissionGuard';"

    return re.sub(import_pattern, replacement, content)

def wrap_component(content: str, module: str, component_type: str, start_marker: str, end_marker: str) -> str:
    """ครอบ Component ด้วย PermissionGuard"""
    permission_key = PERMISSION_MAPPINGS[module][component_type]

    # Pattern สำหรับหา section ที่ต้องครอบ
    pattern = rf"({start_marker}.*?{end_marker})"

    def replace_fn(match):
        section = match.group(1)
        # ถ้าครอบไว้แล้ว ไม่ต้องทำอีก
        if '<PermissionGuard' in section:
            return section

        # ครอบด้วย PermissionGuard
        indent = '      '  # 6 spaces
        return f'{indent}<PermissionGuard componentKey="{permission_key}">\n{section}\n{indent}</PermissionGuard>'

    return re.sub(pattern, replace_fn, content, flags=re.DOTALL)

def process_file(file_path: Path, module: str):
    """ประมวลผลไฟล์หนึ่งไฟล์"""
    print(f"Processing {file_path}...")

    # อ่านไฟล์
    content = file_path.read_text(encoding='utf-8')
    original_content = content

    # เพิ่ม import
    content = add_import(content)

    # Accounting Page
    if module == 'accounting':
        # KPIs
        content = wrap_component(
            content, module, 'kpis',
            r'{/\* KPI Cards \*/}',
            r'</PermissionGuard>|: null}'
        )
        # ยังมี components อื่นๆ แต่ในที่นี้จะใช้วิธีแทรกด้วยมือ

    # ถ้ามีการเปลี่ยนแปลง ให้บันทึก
    if content != original_content:
        file_path.write_text(content, encoding='utf-8')
        print(f"✓ Updated {file_path}")
    else:
        print(f"- No changes needed for {file_path}")

def main():
    # Base path
    base_path = Path(__file__).parent.parent / 'src' / 'app'

    # Process each module
    modules = ['accounting', 'purchase', 'inventory']

    for module in modules:
        page_file = base_path / module / 'page.tsx'
        if page_file.exists():
            process_file(page_file, module)
        else:
            print(f"Warning: {page_file} not found")

    print("\nDone!")

if __name__ == '__main__':
    main()
