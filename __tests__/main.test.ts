/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { http, HttpResponse } from 'msw';
import { graphql } from 'msw'
import { setupServer } from "msw/node";
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)


                             
const github = graphql.link('https://api.github.com/graphql')

const server = setupServer(
    github.query('getRepo', ({query, variables}) => {
      console.log(query)
      console.log(variables)
      return HttpResponse.json(
        {
          data: {
            repository: {
              __typename: 'Repository',
              id :'test',
              url: 'test-url'}
            }
        }
      
      )})
    ,
    github.mutation('CreateTheIssue', () => {
      return HttpResponse.json(
        {
          data: {
            createIssue: {
              issue:
              {id:'test-issue',title:'The test issue', number:2, body: 'The issue that would be created'}
            }
          }
        }
      );
    }),
    github.mutation('AttachSubIssue', () => {
      return HttpResponse.json(
        {
          data: { sub_issue: {issue: {title:'The sub issue'} }}
        }
      );
    }),
    graphql.operation(({ query, variables }) => {
    // Intercept all GraphQL operations and respond
    // to them with the error response.
      console.log(query)
      console.log(variables)
      return HttpResponse.json({
        errors: [{ message: 'Request failed' }],
      })
    }),
    http.all(/.*/, () => {
      return HttpResponse.json("hello")
    })
);
server.events.on('request:start', ({ request, requestId }) => {
  console.log('Outgoing request:', request.method, request.url)
})
server.events.on('request:unhandled', console.log)


// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.ts', () => {

  beforeAll(()=> {
    
    process.env.GITHUB_REPOSITORY="test/test-repo"
    process.env.GITHUB_OWNER="test"
    server.listen()
    //console.log(server)
  });
  afterAll(()=> {
    server.close()
  });

  beforeEach(() => {
    //jest.clearAllMocks()
    server.restoreHandlers();
    
  })

  afterEach(() => {
    //console.log(server.listHandlers())
  })
jest.setTimeout(50_000_000)
  it('Create Sub Issues', async () => {
    
    jest.mocked(core.getInput).mockReturnValue("test")
    console.log(global.fetch)
    await run()

    expect(core.setFailed).not.toHaveBeenCalled();
    
  })
})
