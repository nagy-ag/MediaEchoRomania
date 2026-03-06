---
name: logging-rule
description: Use when writing or modifying logging in backend code, API routes, Convex functions, or Python workers. Enforces request-centric structured logging using wide events (canonical log lines) so each request/job emits one context-rich event instead of scattered console logs.
---

Request-Centric Wide Event Logging

Use this rule whenever writing backend code, API routes, Convex functions,
or Python worker jobs.

Goal:
Every request or job must emit one structured "wide event" containing
all debugging context.

Logs must be queryable structured data, not scattered console logs.

---------------------------------------------------------------------

CORE PRINCIPLE

Do NOT log what the code is doing.

Log what happened to the request.

Instead of multiple log lines:

console.log("starting request")
console.log("querying DB")
console.log("calling API")

Emit ONE structured event after the request completes.

---------------------------------------------------------------------

IDENTITY WITHOUT AUTH

If the system has no authenticated users, identify requests using:

request_id
session_id
anonymous_id
trace_id
ip_hash
user_agent

These allow debugging even without user accounts.

Example:

session_id → stored in cookie/localStorage
request_id → generated per request
trace_id → propagated across services

---------------------------------------------------------------------

EVENT STRUCTURE

Each request should emit one event with structured fields.

Example:

{
  event: "chat_generate",

  request: {
    request_id: "...",
    trace_id: "...",
    session_id: "...",
    route: "/api/chat",
    method: "POST",
    duration_ms: 410
  },

  client: {
    ip_hash: "...",
    user_agent: "...",
    device_type: "desktop"
  },

  business: {
    feature_flags: ["new_ui"],
    model: "gpt-4o",
    tokens_generated: 1200
  },

  infrastructure: {
    service: "nextjs-api",
    deployment_platform: "vercel",
    region: "iad1",
    git_commit: "abc123"
  },

  performance: {
    convex_reads: 2,
    convex_writes: 1,
    external_api_ms: 310
  },

  outcome: {
    status: "success | error",
    error_code: null
  }
}

---------------------------------------------------------------------

NEXT.JS / REACT RULES

Client logs should capture:

request_id
trace_id
session_id
user_action

When making API requests:

- generate request_id
- send trace_id header
- backend attaches the same trace_id

This allows correlating frontend and backend events.

---------------------------------------------------------------------

CONVEX RULES

Each mutation or query must log:

function_name
request_id
duration_ms
db_reads
db_writes

Convex events should attach to the same trace_id
used by the originating request.

Emit one event per mutation.

---------------------------------------------------------------------

PYTHON WORKER RULES

Each ML job emits one event.

Example fields:

job_id
request_id
model_name
dataset
duration_ms
memory_usage
gpu_usage
error_status

This lets you debug async pipelines.

---------------------------------------------------------------------

DEPLOYMENT CONTEXT (IMPORTANT)

Always include deployment metadata:

git_commit
github_run_id
deployment_platform (vercel | railway)
environment (dev | preview | prod)
region

This allows answering:

"Did this bug start after the latest deploy?"

---------------------------------------------------------------------

HIGH CARDINALITY FIELDS (REQUIRED)

Always include:

request_id
trace_id
session_id
job_id
deployment_id

High cardinality identifiers make debugging possible.

---------------------------------------------------------------------

SAMPLING RULE

To control cost:

Always keep:

errors
slow requests (above P99)
requests from debug sessions

Randomly sample successful fast requests.

---------------------------------------------------------------------

ANTI-PATTERNS

Never rely on scattered logs like:

console.log("fetching data")
console.log("query success")
console.log("sending response")

These lose context when requests interleave.

EXTRA:
Extra (important for your stack)

Since you're using Vercel + Railway + GitHub, add these automatically:

Environment fields to always log

git_commit
github_branch
github_run_id
deployment_id
platform = "vercel | railway"
environment = "dev | preview | prod"

These help answer things like:

Did a bug start after a deploy?

Is it only happening in preview?

Is it only on Railway worker?

One small improvement for your AI project

Since you have ML + agents, add these fields too:

model
prompt_tokens
completion_tokens
tool_calls
agent_step
latency_model_ms

These make debugging LLM failures much easier.

---------------------------------------------------------------------

FINAL STANDARD

Every request or job must produce ONE structured event
containing the full request context.

Logs must allow answering questions like:

"Show all failed AI generations in the last hour
for sessions using model X on the latest deployment."

without manual log searching.