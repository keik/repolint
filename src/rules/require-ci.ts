import { report } from "../reporter";
import { Repository } from "../types";
import * as Utils from "../utils";

const RULE_NAME = "require-ci";

export const requireCI = async (repo: Repository): void => {
  // TODO: configurable
  const opts = { path: ".circleci/config.yml" };
  try {
    const rawContent = await Utils.getContents(repo, opts.path);

    if (Array.isArray(rawContent)) throw new Error("directory exists.");

    // TODO: Lint YAML contents
    // const content = Buffer.from(rawContent.content ?? "", "base64").toString();
  } catch (e) {
    report({
      rule: RULE_NAME,
      repo: repo.name,
      message: `CI settings ${opts.path} is not exist.`,
    });
  }
};
