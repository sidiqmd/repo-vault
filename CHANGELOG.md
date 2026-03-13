# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-03-13

### Added

- **Landing page** with animated vault preview, feature highlights, and pricing section
- **Social authentication** via GitHub and Google using Better Auth (self-hosted)
- **Guest mode** with full functionality using localStorage — no sign-up required
- **Vault views** — Grid, List, and Kanban board layouts with search, filter, and sort
- **One-click repo capture** — paste a GitHub URL to auto-fetch metadata (stars, forks, language, topics, README)
- **AI-powered summaries** — auto-generate plain-English descriptions via Anthropic Claude
- **Smart categorization** — AI suggests categories (`ai-ml`, `dev-tools`, `cli`, etc.)
- **Shared repo cache** — enrichment data is cached server-side to reduce API calls and costs
- **Detail panel** with Overview and README tabs, notes, tags, and rating
- **User settings** — default view, sort, card density, theme, and feature toggles
- **Dark/light theme** toggle with warm editorial aesthetic
- **PWA support** — installable on mobile with share target for capturing repos from the browser share menu
- **Cloud sync** — authenticated users get MongoDB-backed storage with automatic guest data migration
- **Security hardening** — Helmet, rate limiting, Zod input validation, and structured Pino logging
