import * as core from '@actions/core'
import * as github from '@actions/github'
import { graphql } from "@octokit/graphql";
import { Repository } from "@octokit/graphql-schema";

import { Context } from '@actions/github/lib/context.js'
/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {

    const gh: Context  = github.context
    const octokit = github.getOctokit(core.getInput("token"))
    const base_issue = gh.payload.issue
    console.log(base_issue)
    
    const {repository} = await octokit.graphql<{repository: Repository}>(
    {query:`query lastIssues($owner: String!, $repo: String!) {
  repository(owner:$owner, name:$repo) {
    issues(last:3) {
      edges {
        node {
          title
        }
      }
    }
  }
}`, 
  owner: gh.repo.owner,
  repo: gh.repo.repo
    }
    )
    console.log(repository.issues.edges)

    
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
