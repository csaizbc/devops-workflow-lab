# DevOps Workflow Lab

A small end-to-end project for learning GitHub collaboration, automation, testing, release, and deployment workflows.

## Features

- Load sample research-paper data from JSON.
- Validate required paper fields.
- Count papers by research category.
- Generate a dashboard-ready JSON report.

## Project structure

```text
devops-workflow-lab/
├── data/
│   └── papers.json
├── public/
│   └── data/
│       └── report.json
├── src/
│   └── generate_report.py
└── README.md
```

## Requirements

- Python 3.10 or later

## Run locally

```bash
python src/generate_report.py
```

On Windows, you can also use:

```bash
py src/generate_report.py
```

The generated report is written to:

```text
public/data/report.json
```

## Development workflow

```text
Issue → Branch → Commit → Pull Request → Review → Merge
```

## License

This project is licensed under the MIT License.