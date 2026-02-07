

# 延长数据范围至 4 年（2022-2026）

## 背景
目前数据库只有 2024-01 至 2026-02 的数据。经测试，OpenDOSM PriceCatcher CSV 从 2022-01 开始可用，可以将数据范围扩展到 4 年。

## 需要修改的内容

### 1. 回填 2022-2023 年历史数据
调用 `sync-dosm` 边缘函数，按月顺序回填 2022-01 至 2023-12（共 24 个月）的价格数据和菜篮计算。需要按时间顺序执行，因为跨月滚动窗口依赖前一个月的数据。

### 2. 同步更早的 CPI 数据
当前 CPI 同步函数只获取 2024 年起的数据。需要修改 `sync-dosm` 边缘函数中的 CPI 获取逻辑，将 `date_start` 从 `2024-01-01` 改为 `2022-01-01`，以覆盖完整的 4 年周期。

### 3. 调整前端的时间筛选器
- 新增 `"3y"` 和 `"4y"` 时间段选项
- 更新 `TimePeriod` 类型定义（`useFoodPrices.ts`）
- 更新 `getStartDate()` 函数处理新时间段
- 更新 `PriceHeader.tsx` 中的 `PERIODS` 数组
- 修改 `"All Time"` 的起始日期从 `2024-01-01` 改为 `2022-01-01`

### 4. 更新翻译文本
在 `translations.ts` 中新增：
- `period.3y`: "近三年" / "3 Years"
- `period.4y`: "近四年" / "4 Years"
- `stats.since.3y`: "三年以来" / "since 3 years ago"
- `stats.since.4y`: "四年以来" / "since 4 years ago"

### 5. 更新关于页面和菜篮方法说明
- 将滚动窗口描述从 "7天" 改为 "14天"（与实际代码一致）
- 更新数据可用时间说明

---

## 技术细节

### 涉及文件
| 文件 | 改动 |
|------|------|
| `supabase/functions/sync-dosm/index.ts` | CPI `date_start` 改为 `2022-01-01` |
| `src/hooks/useFoodPrices.ts` | `TimePeriod` 新增 `"3y" / "4y"`；`getStartDate` 调整 `"all"` 起始日期 |
| `src/components/PriceHeader.tsx` | `PERIODS` 数组新增选项 |
| `src/lib/translations.ts` | 新增翻译条目；修正 "7天" 为 "14天" |

### 数据回填步骤
1. 修改 CPI 函数并部署
2. 运行 CPI 同步获取 2022-2023 的 CPI 数据
3. 按月顺序调用 sync-dosm 回填 2022-01 至 2023-12（每次处理 1-2 个月，避免超时）
4. 验证数据完整性

### 预计数据量
- 每月约 400-500 条价格记录（17 个品项 + 菜篮 x ~25 天）
- 24 个月共约 10,000-12,000 条新记录

