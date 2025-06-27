# Release Branch Issue Creator

This action, on the creation of issues, editing of labels, creates or deletes
branch specific sub-issue based on set labels to allow feature, bug, and task
tracking between release branches.

## To Use

1. Create workflow on default branch that is triggered by issue creation and
   changes TODO: example

2. Label issues with `branch:<branch name>`, for example `branch:1.0` for your
   1.0 release branch

If the branch doesn't exist no sub-issue will be created. If it does exist a
sub-issue will be created on this issue.
