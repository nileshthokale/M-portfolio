import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateContactForm,
  filterSkillCategories,
  getNextProjectSlug,
} from './portfolioLogic';
import { PORTFOLIO_DATA } from '../data/portfolio';

test('validateContactForm rejects empty inputs with field errors', () => {
  const res = validateContactForm({ name: '', email: '', message: '' });
  assert.equal(res.valid, false);
  assert.ok(res.errors.name);
  assert.ok(res.errors.email);
  assert.ok(res.errors.message);
});

test('validateContactForm rejects malformed email and short message', () => {
  const res = validateContactForm({
    name: 'Nilesh',
    email: 'not-an-email',
    message: 'Too short',
  });
  assert.equal(res.valid, false);
  assert.equal(res.errors.name, undefined);
  assert.ok(res.errors.email);
  assert.ok(res.errors.message);
});

test('validateContactForm accepts valid payload', () => {
  const res = validateContactForm({
    name: 'Recruiter Jane',
    email: 'jane@company.com',
    phone: '+91 97664 07124',
    message: 'We would love to interview you for our Security Data Science role.',
  });
  assert.equal(res.valid, true);
  assert.deepEqual(res.errors, {});
});

test('filterSkillCategories returns all categories or filters by id', () => {
  const all = filterSkillCategories(PORTFOLIO_DATA.skillCategories, 'all');
  assert.equal(all.length, PORTFOLIO_DATA.skillCategories.length);

  const cyber = filterSkillCategories(PORTFOLIO_DATA.skillCategories, 'cybersecurity');
  assert.equal(cyber.length, 1);
  assert.equal(cyber[0].category, 'Cybersecurity');
});

test('projects data has GoKaliFree as project 01 and 2 empty templates', () => {
  assert.equal(PORTFOLIO_DATA.projects[0].slug, 'gokalifree');
  assert.equal(PORTFOLIO_DATA.projects[0].isEmptyTemplate, false);
  assert.equal(PORTFOLIO_DATA.projects[1].isEmptyTemplate, true);
  assert.equal(PORTFOLIO_DATA.projects[2].isEmptyTemplate, true);
});

test('getNextProjectSlug cycles through project slugs circularly', () => {
  const slugs = PORTFOLIO_DATA.projects.map((p) => p.slug);
  assert.equal(getNextProjectSlug(slugs, 'gokalifree'), 'project-slot-02');
  assert.equal(getNextProjectSlug(slugs, 'project-slot-03'), 'gokalifree');
});
