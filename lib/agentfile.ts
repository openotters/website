import type { AgentConfig } from "./ghcr"

// renderAgentfile reconstructs an Agentfile-shaped source string from
// a parsed agent config blob. The output mirrors the canonical
// Agentfile grammar (FROM / RUNTIME / MODEL / NAME / ENV / CONFIG /
// CONTEXT / BIN / LABEL) so it reads like the artifact you'd commit,
// not the JSON the daemon stores.
//
// This is best-effort: heredoc bodies are emitted verbatim; quoted
// strings are emitted with escape semantics that match a shell-like
// parser. Round-tripping through `otters image build` isn't a goal —
// the goal is human readability on the detail page.
export function renderAgentfile(cfg: AgentConfig): string {
	const lines: string[] = []

	if (cfg.from) lines.push(`FROM ${cfg.from}`)
	if (cfg.runtime) lines.push(`RUNTIME ${cfg.runtime}`)
	if (cfg.model) lines.push(`MODEL ${cfg.model}`)
	if (cfg.name) lines.push(`NAME ${cfg.name}`)

	if (cfg.envs?.length) {
		lines.push("")
		for (const env of cfg.envs) {
			const value = env.value ?? ""
			const desc = env.description ? ` ${quote(env.description)}` : ""
			lines.push(`ENV ${env.key}=${quote(value)}${desc}`)
		}
	}

	if (cfg.configs?.length) {
		lines.push("")
		for (const c of cfg.configs) {
			const desc = c.description ? ` ${quote(c.description)}` : ""
			lines.push(`CONFIG ${c.key}=${c.value}${desc}`)
		}
	}

	if (cfg.contexts?.length) {
		for (const ctx of cfg.contexts) {
			lines.push("")
			const desc = ctx.description ? ` ${quote(ctx.description)}` : ""
			lines.push(`CONTEXT ${ctx.name}${desc} <<EOF`)
			lines.push(ctx.content)
			lines.push("EOF")
		}
	}

	if (cfg.bins?.length) {
		lines.push("")
		for (const bin of cfg.bins) {
			const desc = bin.description ? ` ${quote(bin.description)}` : ""
			if (bin.usage) {
				lines.push(`BIN ${bin.name} ${bin.image}${desc} <<EOF`)
				lines.push(bin.usage)
				lines.push("EOF")
			} else {
				lines.push(`BIN ${bin.name} ${bin.image}${desc}`)
			}
		}
	}

	if (cfg.labels && Object.keys(cfg.labels).length > 0) {
		lines.push("")
		for (const [k, v] of Object.entries(cfg.labels)) {
			lines.push(`LABEL ${k}=${quote(v)}`)
		}
	}

	return lines.join("\n")
}

function quote(s: string): string {
	// Double-quote and escape embedded double-quotes / backslashes so
	// the rendered Agentfile parses the same way the source did.
	return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
}
