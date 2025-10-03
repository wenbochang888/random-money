#!/bin/bash

# 配色方案切换脚本
# 使用方法: ./switch-theme.sh [purple|blue|orange|green]

THEME=$1

if [ -z "$THEME" ]; then
    echo "🎨 配色方案切换工具"
    echo ""
    echo "使用方法: ./switch-theme.sh [主题名称]"
    echo ""
    echo "可用主题："
    echo "  purple  - 紫色魔幻风（默认）"
    echo "  blue    - 蓝色科技风"
    echo "  orange  - 橙红渐变风"
    echo "  green   - 绿色清新风"
    echo ""
    echo "示例: ./switch-theme.sh blue"
    exit 1
fi

case $THEME in
    purple)
        git checkout src/App.vue
        echo "✅ 已切换到紫色魔幻风"
        ;;
    blue)
        cp src/App.vue.theme-blue src/App.vue
        echo "✅ 已切换到蓝色科技风"
        ;;
    orange)
        cp src/App.vue.theme-orange src/App.vue
        echo "✅ 已切换到橙红渐变风"
        ;;
    green)
        cp src/App.vue.theme-green src/App.vue
        echo "✅ 已切换到绿色清新风"
        ;;
    *)
        echo "❌ 未知主题: $THEME"
        echo "可用主题: purple, blue, orange, green"
        exit 1
        ;;
esac

echo ""
echo "💡 提示: 刷新浏览器查看新配色效果"

