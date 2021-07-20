# Create Branch GitHub Action

This action creates a new branch with the same commit reference as the branch it is being ran on, or your chosen reference when specified.

## Inputs

### `branch`

**Required** The name of the branch to create.

### `sha`

**Optional** The SHA1 value for the branch reference.

### `orphan`

**Optional** If a commit should be created pointing to a empty tree and use its
sha. `true` to enable.

## Example usage

```
uses: peterjgrainger/action-create-branch@v2.0.1
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
with:
  branch: 'release-notes'
```
