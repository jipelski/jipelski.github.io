import fs from 'node:fs';
import fetch from 'node-fetch';
import path from 'node:path';

/***
 * fetchGitHubRepos(@user_name) fetches the repositories of the passed user using the GitHub API.
 * @param user_name - the name of the user whose repositories are going to be fetched
 */
async function fetchGitHubRepos(user_name) {
    const url = `https://api.github.com/users/${user_name}/repos`;

    try {
        console.log(`Fetching repositories for user: ${user_name} from URL: ${url}`);
        const response = await fetch(url);
        if (response.ok) {
            const repos = await response.json();
            console.log(`Fetched ${repos.length} repositories`);
            return repos;
        } else {
            console.error(`Failed to fetch repos: ${response.status} ${response.statusText}`);
            return [];
        }
    } catch (error) {
        console.error(`Error fetching repos: ${error}`);
        return [];
    }
}

/***
 * fetchGitHubRepoData(repo, user_name) fetches the files at the specified repository and returns a repoData
 * object.
 * @param repo - the repository from which data will be extracted
 * @param user_name - the name of the owner
 */
async function fetchGitHubRepoData(repo, user_name) {
    const baseURL = `https://api.github.com/repos/${user_name}/${repo.name}/contents`;
    const repoData = {};

    try {
        console.log(`Fetching README and image for repository: ${repo.name}`);
        const readmeURL = `${baseURL}/README.md`;
        const readmeResponse = await fetch(readmeURL);
        if (readmeResponse.status === 200) {
            const readmeContent = await readmeResponse.json();
            repoData.readme = await (await fetch(readmeContent.download_url)).text();
        } else {
            repoData.readme = "Repo README not found";
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

        console.log(`Fetched data for repository: ${repo.name}`);
        return repoData;
    } catch (error) {
        console.error(`Error fetching repo data for ${repo.name}: ${error}`);
        return {};
    }
}

/***
 * updateReposData(user_name, outputPath) fetches the existing public repositories of the given user and updates a local
 * json file.
 * @param user_name - the name of the user
 * @param outputPath - the path where the json file will be saved
 */
async function updateReposData(user_name, outputPath) {
    const reposData = {};
    const repoNames = await fetchGitHubRepos(user_name);

    for (let repo of repoNames) {
        console.log(`Processing repo: ${repo.name}`);
        reposData[repo.name] = await fetchGitHubRepoData(repo, user_name);
    }

    console.log('Final repos data:', reposData);

    const jsonFilePath = path.join(outputPath, 'repos_data.json');

    console.log(`Writing data to file: ${jsonFilePath}`);
    fs.mkdirSync(outputPath, { recursive: true });

    try {
        fs.writeFileSync(jsonFilePath, JSON.stringify(reposData, null, 4));
        console.log(`Data successfully saved to ${jsonFilePath}`);
    } catch (error) {
        console.error(`Error writing to file ${jsonFilePath}: ${error}`);
    }
}

const args = process.argv.slice(2);
const userName = args[0];
const outputPath = args[1];

if (!userName || !outputPath) {
    console.error('Something went very wrong...');
    process.exit(1);
}

updateReposData(userName, outputPath)
    .then(() => console.log('Update completed'))
    .catch(error => console.error(`Error updating repos data: ${error}`));
