# Parked: hosted answer link

**Status:** parked by the founder, 15 November 2026. Team answers ship with packet files in git (Option A).

**The idea.** Each interview packet becomes a private web page. A team member opens a link on any device, answers their round, and Keel pulls the answers back into `.keel/rounds/`. The owner sees who has replied.

**Why it is parked.**
- Answers would sit on a third party's server. Interview answers can include security gaps, compliance exposure, costs and customer names; they are as sensitive as the documents they feed.
- Where consumers' answers may be stored is an open founder decision. Its retention and access terms would need review first.
- It needs hosting, access control, link expiry and a pull step: the most work of the three options.
- Packet files already cover the need, and the packet format should settle before anything is built on it.

**What would unpark it.**
1. A founder decision on whether answers may be stored on a hosted service, and where.
2. Real demand: teams whose respondents cannot work with a file.
3. A packet format that has been stable through at least one release.

**Constraints if it is built.**
- The packet file in git stays the source of truth. The link is only a way to fill it in.
- Every answer is still marked person or Claude, and a person can overrule.
- Blind questions are enforced on the server: a respondent cannot fetch others' answers before the reveal.
- Links expire and are tied to one round and one person; the owner can revoke them.
- No keys or passwords are accepted; the same checker runs on submission.
- Opt-in per project, off by default, and adoptable by existing projects through `/keel upgrade` like every other change.
