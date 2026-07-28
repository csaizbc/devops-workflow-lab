const REPORT_URL = "./data/report.json";

const elements = {
  statusPanel: document.querySelector("#status-panel"),
  statusTitle: document.querySelector("#status-title"),
  statusMessage: document.querySelector("#status-message"),
  dashboard: document.querySelector("#dashboard"),
  totalPapers: document.querySelector("#total-papers"),
  generatedAt: document.querySelector("#generated-at"),
  categoryList: document.querySelector("#category-list"),
  paperList: document.querySelector("#paper-list"),
};

function showStatus(title, message, isError = false) {
  elements.statusTitle.textContent = title;
  elements.statusMessage.textContent = message;
  elements.statusPanel.classList.toggle("is-error", isError);
  elements.statusPanel.hidden = false;
  elements.dashboard.hidden = true;
}

function showDashboard() {
  elements.statusPanel.hidden = true;
  elements.dashboard.hidden = false;
}

function createEmptyMessage(message) {
  const element = document.createElement("p");
  element.className = "empty-message";
  element.textContent = message;
  return element;
}

function formatGeneratedAt(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatPublishedDate(value) {
  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return value || "Unknown date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function normalizeReport(report) {
  if (!report || typeof report !== "object") {
    throw new Error("The report is not a valid JSON object.");
  }

  const papers = Array.isArray(report.papers) ? report.papers : [];

  const categoryCounts =
    report.category_counts &&
    typeof report.category_counts === "object" &&
    !Array.isArray(report.category_counts)
      ? report.category_counts
      : {};

  const totalPapers = Number.isInteger(report.total_papers)
    ? report.total_papers
    : papers.length;

  return {
    generatedAt: report.generated_at,
    totalPapers,
    categoryCounts,
    papers,
  };
}

function renderCategories(categoryCounts) {
  elements.categoryList.replaceChildren();

  const categories = Object.entries(categoryCounts)
    .filter(
      ([name, count]) =>
        name.trim() !== "" &&
        Number.isFinite(count) &&
        count >= 0,
    )
    .sort((left, right) => right[1] - left[1]);

  if (categories.length === 0) {
    elements.categoryList.append(
      createEmptyMessage("No category statistics are available yet."),
    );
    return;
  }

  const maximumCount = Math.max(
    ...categories.map(([, count]) => count),
    1,
  );

  for (const [name, count] of categories) {
    const card = document.createElement("article");
    card.className = "category-card";

    const header = document.createElement("div");
    header.className = "category-header";

    const categoryName = document.createElement("p");
    categoryName.className = "category-name";
    categoryName.textContent = name;

    const categoryCount = document.createElement("span");
    categoryCount.className = "category-count";
    categoryCount.textContent = String(count);
    categoryCount.setAttribute(
      "aria-label",
      `${count} papers in ${name}`,
    );

    const bar = document.createElement("div");
    bar.className = "category-bar";
    bar.setAttribute("aria-hidden", "true");

    const barFill = document.createElement("div");
    barFill.className = "category-bar-fill";
    barFill.style.setProperty(
      "--bar-width",
      `${(count / maximumCount) * 100}%`,
    );

    header.append(categoryName, categoryCount);
    bar.append(barFill);
    card.append(header, bar);
    elements.categoryList.append(card);
  }
}

function renderPapers(papers) {
  elements.paperList.replaceChildren();

  if (papers.length === 0) {
    elements.paperList.append(
      createEmptyMessage("No research papers have been collected yet."),
    );
    return;
  }

  const sortedPapers = [...papers].sort((left, right) =>
    String(right.published_at).localeCompare(
      String(left.published_at),
    ),
  );

  for (const paper of sortedPapers) {
    const card = document.createElement("article");
    card.className = "paper-card";

    const metadata = document.createElement("div");
    metadata.className = "paper-meta";

    const category = document.createElement("span");
    category.className = "paper-category";
    category.textContent = paper.category || "Uncategorized";

    const publishedAt = document.createElement("time");
    publishedAt.className = "paper-date";
    publishedAt.dateTime = paper.published_at || "";
    publishedAt.textContent = formatPublishedDate(
      paper.published_at,
    );

    const title = document.createElement("h3");
    title.className = "paper-title";
    title.textContent = paper.title || "Untitled paper";

    const identifier = document.createElement("p");
    identifier.className = "paper-id";
    identifier.textContent = paper.id || "No identifier";

    metadata.append(category, publishedAt);
    card.append(metadata, title, identifier);
    elements.paperList.append(card);
  }
}

function renderReport(report) {
  const normalizedReport = normalizeReport(report);

  elements.totalPapers.textContent = String(
    normalizedReport.totalPapers,
  );

  elements.generatedAt.textContent = formatGeneratedAt(
    normalizedReport.generatedAt,
  );

  if (normalizedReport.generatedAt) {
    elements.generatedAt.dateTime = normalizedReport.generatedAt;
  }

  renderCategories(normalizedReport.categoryCounts);
  renderPapers(normalizedReport.papers);
  showDashboard();
}

async function loadReport() {
  try {
    const response = await fetch(REPORT_URL, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `The report request failed with status ${response.status}.`,
      );
    }

    const report = await response.json();
    renderReport(report);
  } catch (error) {
    console.error("Unable to load the research report:", error);

    showStatus(
      "Unable to load research data",
      "Check that report.json exists and that the page is served through a local web server.",
      true,
    );
  }
}

loadReport();