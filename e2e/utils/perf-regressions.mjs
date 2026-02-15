import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const CURRENT_REPORT_PATH = path.join(ROOT, "e2e/reports/perf-trends.json");
const REGRESSION_REPORT_PATH = path.join(
  ROOT,
  "e2e/reports/perf-regressions.json"
);
const BUDGET_PATH = path.join(ROOT, "docs/perf-budgets.json");
const BASELINE_GIT_PATH = "HEAD:e2e/reports/perf-trends.json";

const METRICS = [
  "ttfbMs",
  "domContentLoadedMs",
  "loadEventEndMs",
  "fcpMs",
  "jsRequestCount",
  "cssRequestCount",
  "totalTransferredBytesApprox",
  "totalResourceCount",
];

const POLICY_BUDGET_ONLY = "budget_only_trends_informational";
const POLICY_BASELINE_AND_BUDGET = "baseline_and_budget";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function loadBaselineFromGit() {
  try {
    const raw = execSync(`git show ${BASELINE_GIT_PATH}`, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf-8",
    });
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function asNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function percentWorse(current, baseline) {
  if (baseline <= 0) return null;
  return ((current - baseline) / baseline) * 100;
}

function getBudgetForRoute(budgets, route, metric) {
  const routeBudget = budgets.routes?.[route]?.[metric];
  if (typeof routeBudget === "number") return routeBudget;

  const defaultBudget = budgets.defaults?.[metric];
  if (typeof defaultBudget === "number") return defaultBudget;

  return null;
}

function compareReports(current, baseline, budgets) {
  const policy =
    budgets?.policy === POLICY_BASELINE_AND_BUDGET
      ? POLICY_BASELINE_AND_BUDGET
      : POLICY_BUDGET_ONLY;
  const thresholdPercent =
    typeof budgets.regressionThresholdPercent === "number"
      ? budgets.regressionThresholdPercent
      : 15;

  const baselineByRoute = new Map(
    (baseline?.routes || []).map((route) => [route.route, route])
  );

  const regressions = [];
  let trendWarningsCount = 0;

  const sortedRoutes = [...(current.routes || [])].sort((a, b) =>
    String(a.route).localeCompare(String(b.route))
  );

  for (const routeSnapshot of sortedRoutes) {
    const route = String(routeSnapshot.route);
    const baselineSnapshot = baselineByRoute.get(route) || null;

    for (const metric of METRICS) {
      const currentValue = asNumber(routeSnapshot[metric]);
      if (currentValue === null) continue;

      const budget = getBudgetForRoute(budgets, route, metric);
      const budgetExceeded =
        typeof budget === "number" ? currentValue > budget : false;

      let baselineValue = null;
      let percentChange = null;
      let thresholdExceeded = false;

      if (baselineSnapshot) {
        baselineValue = asNumber(baselineSnapshot[metric]);
        if (baselineValue !== null) {
          percentChange = percentWorse(currentValue, baselineValue);
          thresholdExceeded =
            typeof percentChange === "number" &&
            percentChange > thresholdPercent;
          if (thresholdExceeded) {
            trendWarningsCount += 1;
          }
        }
      }

      const shouldFlagRegression =
        policy === POLICY_BASELINE_AND_BUDGET
          ? budgetExceeded || thresholdExceeded
          : budgetExceeded;

      if (shouldFlagRegression) {
        regressions.push({
          route,
          metric,
          currentValue,
          baselineValue,
          percentChange:
            percentChange === null
              ? null
              : Math.round(percentChange * 100) / 100,
          thresholdPercent,
          budget,
          budgetExceeded,
          thresholdExceeded,
        });
      }
    }
  }

  regressions.sort((a, b) =>
    `${a.route}:${a.metric}`.localeCompare(`${b.route}:${b.metric}`)
  );

  return {
    generatedAt: new Date().toISOString(),
    policy,
    baselineSource: baseline ? BASELINE_GIT_PATH : null,
    currentSource: "e2e/reports/perf-trends.json",
    budgetsSource: "docs/perf-budgets.json",
    nonGating: true,
    summary: {
      totalRegressions: regressions.length,
      budgetExceededCount: regressions.filter((item) => item.budgetExceeded)
        .length,
      trendRegressionCount:
        policy === POLICY_BASELINE_AND_BUDGET ? trendWarningsCount : 0,
      trendWarningsCount,
    },
    regressions,
  };
}

function main() {
  if (!fs.existsSync(CURRENT_REPORT_PATH)) {
    console.error(
      "perf-trends.json is missing. Run the perf trends test first."
    );
    process.exit(1);
  }

  if (!fs.existsSync(BUDGET_PATH)) {
    console.error("perf-budgets.json is missing.");
    process.exit(1);
  }

  const current = readJson(CURRENT_REPORT_PATH);
  const budgets = readJson(BUDGET_PATH);
  const baseline = loadBaselineFromGit();

  const report = compareReports(current, baseline, budgets);

  fs.mkdirSync(path.dirname(REGRESSION_REPORT_PATH), { recursive: true });
  fs.writeFileSync(REGRESSION_REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`Perf regression report written to ${REGRESSION_REPORT_PATH}`);
  console.log(`Total regressions: ${report.summary.totalRegressions}`);
}

main();
