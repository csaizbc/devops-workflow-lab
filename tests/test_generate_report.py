import json

import pytest

from src.generate_report import build_report, load_papers, write_report


SAMPLE_PAPERS = [
    {
        "id": "paper-001",
        "title": "Agentic Workflow Evaluation",
        "category": "AI Agents",
        "published_at": "2026-07-21",
    },
    {
        "id": "paper-002",
        "title": "Multi-Agent Coordination",
        "category": "Multi-Agent Systems",
        "published_at": "2026-07-22",
    },
    {
        "id": "paper-003",
        "title": "Research Agents",
        "category": "AI Agents",
        "published_at": "2026-07-23",
    },
]


def test_load_papers_reads_valid_data(tmp_path):
    source_path = tmp_path / "papers.json"
    source_path.write_text(
        json.dumps(SAMPLE_PAPERS),
        encoding="utf-8",
    )

    papers = load_papers(source_path)

    assert papers == SAMPLE_PAPERS


def test_build_report_counts_papers_and_categories():
    report = build_report(
        SAMPLE_PAPERS,
        generated_at="2026-07-28T00:00:00+00:00",
    )

    assert report["generated_at"] == "2026-07-28T00:00:00+00:00"
    assert report["total_papers"] == 3
    assert report["category_counts"] == {
        "AI Agents": 2,
        "Multi-Agent Systems": 1,
    }
    assert report["papers"] == SAMPLE_PAPERS


def test_load_papers_rejects_missing_required_fields(tmp_path):
    source_path = tmp_path / "invalid-papers.json"
    source_path.write_text(
        json.dumps([{"id": "paper-001", "title": "Incomplete"}]),
        encoding="utf-8",
    )

    with pytest.raises(ValueError, match="missing fields"):
        load_papers(source_path)


def test_write_report_creates_json_output(tmp_path):
    output_path = tmp_path / "nested" / "report.json"
    report = build_report(
        SAMPLE_PAPERS,
        generated_at="2026-07-28T00:00:00+00:00",
    )

    write_report(report, output_path)

    assert output_path.exists()
    saved_report = json.loads(output_path.read_text(encoding="utf-8"))
    assert saved_report == report