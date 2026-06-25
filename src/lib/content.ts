import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');

export async function getContent(filename: string) {
    const filePath = path.join(DATA_DIR, filename);
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
}

export async function saveContent(filename: string, content: any) {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
}

export async function getHeroData() {
    return getContent('hero.json');
}

export async function getProjectsData() {
    return getContent('projects.json');
}

export async function getAboutData() {
    return getContent('about.json');
}

export async function getExperienceData() {
    return getContent('experience.json');
}

export async function getSettings() {
    return getContent('settings.json');
}
