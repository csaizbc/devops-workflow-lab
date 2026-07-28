from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT_DIR = Path(__file__).resolve().parents[1]
INPUT_PATH = ROOT_DIR / "data" / "papers.json"
OUTPUT_PATH = ROOT_DIR / "public" / "data" / "report.json"

REQUIRED_FIELDS = {"id", "title", "category", "published_at"}


def load_papers(path: Path = INPUT_PATH) -> list[dict[str, Any]]:
    """Load and validate research-paper records."""
    with path.open("r", encoding="utf-8") as file:
        papers = json.load(file)

    if not isinstance(papers, list):
        raise ValueError("The input JSON must contain a list of papers.")

    for index, paper in enumerate(papers, start=1):
        if not isinstance(paper, dict):
            raise ValueError(f"Paper #{index} must be a JSON object.")

        missing_fields = REQUIRED_FIELDS.difference(paper)
        if missing_fields:
            missing = ", ".join(sorted(missing_fields))
            raise ValueError(f"Paper #{index} is missing fields: {missing}")

    return papers


def build_report(
    papers: list[dict[str, Any]],
    generated_at: str | None = None,
) -> dict[str, Any]:
    """Build category statistics and the dashboard report."""
    category_counts = Counter(paper["category"] for paper in papers)

    return {
        "generated_at": generated_at
        or datetime.now(timezone.utc).isoformat(),
        "total_papers": len(papers),
        "category_counts": dict(sorted(category_counts.items())),
        "papers": papers,
    }


def write_report(
    report: dict[str, Any],
    path: Path = OUTPUT_PATH,
) -> None:
    """Write the generated report as formatted UTF-8 JSON."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    papers = load_papers()
    report = build_report(papers)
    write_report(report)

    print(
        f"Generated report for {report['total_papers']} papers: "
        f"{OUTPUT_PATH}"
    )


if __name__ == "__main__":
    main()
