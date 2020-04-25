import { Octokit } from "@octokit/rest";

import { report } from "../reporter";
import { Repo } from "../types";

const RULE_NAME = "require-branch-protection";

export const requireBranchProtection = (octokit: Octokit) => async (
  repo: Repo
) => {
  const opts = {
    required: {
      required_status_checks: {
        contexts: [
          "ci/circleci: rspec",
          "ci/circleci: test_js",
          "ci/circleci: eslint_flow",
          "ci/circleci: danger",
          "danger/danger",
        ],
      },
      required_pull_request_reviews: { require_code_owner_reviews: true },
    },
  };
  try {
    const {
      data: rawBranchProtection,
    } = await octokit.repos.getBranchProtection({
      owner: repo.owner,
      repo: repo.name,
      branch: repo.default_branch,
    });
    if (opts.required.required_status_checks) {
      if (opts.required.required_status_checks.contexts) {
        opts.required.required_status_checks.contexts.forEach((a) => {
          if (
            !rawBranchProtection.required_status_checks.contexts.includes(a)
          ) {
            report({
              rule: RULE_NAME,
              repo: repo.name,
              message: `Required status checks '${a}' is not exist.`,
            });
          }
        });
      }
    }
    if (opts.required.required_pull_request_reviews) {
      if (
        opts.required.required_pull_request_reviews
          .require_code_owner_reviews &&
        !rawBranchProtection.required_pull_request_reviews
          .require_code_owner_reviews
      ) {
        report({
          rule: RULE_NAME,
          repo: repo.name,
          message: `Pull request reviews are required.`,
        });
      }
    }
  } catch (e) {
    report({
      rule: RULE_NAME,
      repo: repo.name,
      message: `Branch protection is not exist. (default branch: ${repo.default_branch})`,
    });
  }
};