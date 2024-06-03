import fs from 'node:fs';
import fetch from 'node-fetch';
import path from "node:path";

/***
 * fetchGitHubRepos(@user_name) fetches the repositories of the passed user using the GitHub API.
 * @param user_name - the name of the user whose repositories are going to be fetched
 */
async function fetchGitHubRepos(user_name) {
    const url = `https://api.github.com/users/${user_name}/repos`;

    

    const response = await fetch(url);
    if (response.ok) {
        return await response.json();
    } else {
        return []
    }
}

/***
 * fetchGitHubRepoData(repoName, user_name) fetches the files at the specified repository and returns a repoData
 * array object.
 * @param repo - the repository from which data will be extracted
 * @param user_name - the name of the owner
 */
async function fetchGitHubRepoData(repo, user_name) {
    const baseURL = `https://api.github.com/repos/${user_name}/${repo.name}/contents`;
    const repoData = {}

    const readmeURL = `${baseURL}/README.md`;
    
    const readmeResponse = await fetch(readmeURL);
    if (readmeResponse.status === 200) {
        const readmeContent = await readmeResponse.json();
        repoData.readme = await (await fetch(readmeContent.download_url)).text();
    } else {
        repoData.readme = "Repo ReadME not found";
    }

    const imageURL = `${baseURL}/repoImage.jpg`;
    const imageResponse = await fetch(imageURL);
    if (imageResponse.status === 200) {
        const imageContent = await imageResponse.json();
        repoData.image = imageContent.content;
    } else {
        repoData.image = null;
    }

    repoData.description = repo.description;
    repoData.language = repo.language;
    repoData.name = repo.name;

    return repoData;
}

/***
 * updateReposData(user_name) fetches the existing public repositories of the given user and updates a local
 * json file.
 * @param user_name - the name of the user
 */
async function updateReposData(user_name) {
    const reposData = {};
    const repoNames = await fetchGitHubRepos(user_name);

    for (let repo in repoNames) {
        console.log(repoNames[repo]);
        reposData[repoNames[repo].name] = await fetchGitHubRepoData(repoNames[repo], user_name);
    }

    const __dirname = path.resolve();
    const dirPath = path.resolve(__dirname, '../res/files');
    const jsonFilePath = path.join(dirPath, 'repos_data.json');

    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(jsonFilePath, JSON.stringify(reposData, null, 4));
    console.log(`Data saved to ${jsonFilePath}`);
}

updateReposData('jipelski')
    .then(() => console.log('Update completed'))
    .catch(error => console.error(`Error updating repos data: ${error}`));