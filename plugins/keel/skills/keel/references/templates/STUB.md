<!--
  Keel template — STUB.md (a document type that does not apply yet)
  =================================================================
  WHAT THIS IS:
    Keeps a document type present when it does not apply yet. One file at the type's
    usual path (e.g. docs/DEPLOYMENT.md). Quote the interview for the reason; take the
    trigger and its id from the "Stubs" table in references/document-catalog.md.
    No other content: a stub never holds record text. When its trigger fires, the full
    template replaces it (`/keel check` reports it as stub-triggered).
  Keep the keel:stub marker; remove only this guide comment.
-->
# {{TITLE}} — {{PROJECT}}

> **Not needed yet.** {{REASON — quote the founder's answer, e.g. "Deployment: none. It is run from a clone of the repo."}}
>
> **Write it when:** {{TRIGGER — e.g. "the project gets a remote environment (a deploy config such as a Dockerfile or fly.toml appears)"}}
>
> **Meanwhile:** {{WHERE THE FACTS LIVE — e.g. "how to run it locally: [COMMANDS.md](COMMANDS.md)"}}

<!-- keel:stub trigger={{TRIGGER_ID}} -->
