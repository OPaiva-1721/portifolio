// Centraliza todo o conteúdo editável do site.
// Os dados vivem em content.json para que o painel em /#admin consiga reescrevê-los.
// Este módulo existe para manter os imports dos componentes inalterados.
import data from './content.json';

export const bio = data.bio;
export const education = data.education;
export const certifications = data.certifications;
export const commits = data.commits;
export const projects = data.projects;
export const contact = data.contact;
