import * as core from '@actions/core'
import * as github from '@actions/github'
import { Issue, Repository, CreateIssuePayload } from '@octokit/graphql-schema'

import { Context } from '@actions/github/lib/context.js'
/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const gh: Context = github.context
    const octokit = github.getOctokit(core.getInput('token'), {
      request: globalThis.fetch
    })
    const base_issue = gh.payload.issue
    console.log(base_issue)

    // steps
    // 1 get payload and check if issue
    // Created or labels applied
    // loop through labels
    //   if branch:X and branch X exists
    //     create sub issue
    //     assign sub issue to parent
    // Deleted or labels removed
    //  loop through labels
    //     find issues for "branch:X" labels
    //       delete
    // Closed
    //   loop through labels
    //    for each branch:X label find issue
    //      close
    // "sub issue closed"
    //   get parent
    //     find other sub issues
    //     if all closed
    //       close parent
    // "issue reopened"
    //    find and repo sub issues?

    const result = await octokit.graphql<{ repository: Repository }>({
      query: `
      query getRepo($owner: String!, $repo: String!) {
        repository (owner: $owner, name: $repo) {
            id
            url
        }
      }`,
      owner: gh.repo.owner,
      repo: gh.repo.repo
    })
    const { repository } = result
    console.log(repository)

    const { createIssue } = await octokit.graphql<{
      createIssue: CreateIssuePayload
    }>({
      query: `
      mutation CreateTheIssue($repoId: ID!) {
        createIssue(input: { repositoryId: $repoId, title: "Tracking for branch X", body:"for tracking"}) {
          issue {
              title
              number
              body
              id
          }
        }
      }
    `,
      repoId: repository.id
    })
    const issue: Issue = createIssue.issue!
    console.log('Created %s', issue)

    // would work but we need the issues actual node id
    const { sub_issue } = await octokit.graphql<{ sub_issue: Issue }>({
      query: `
      mutation AttachSubIssue($parentNumber: ID!, $id: ID!) {
      
      addSubIssue(input: {issueId: $parentNumber, subIssueId: $id}) {
         subIssue {
          title
         }

        issue {
         title
        }
    }
}`,
      id: issue.id,

      parentNumber: base_issue?.id
    })
    console.log(sub_issue)
  } catch (error) {
    console.log(error)
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
