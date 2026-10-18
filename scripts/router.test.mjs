import assert from 'node:assert/strict';
import { test } from 'node:test';
import { currentPath, currentQuery } from '../site/js/router.js';

test('el inicio y los enlaces válidos conservan su ruta', () => {
  for (const [hash, expected] of [
    ['', '/'], ['#/menu', '/menu'], ['#/producto/caf%C3%A9', '/producto/café'],
    ['#/gerente?periodo=hoy', '/gerente'],
  ]) {
    globalThis.location = { hash };
    assert.equal(currentPath(), expected);
  }
});

test('un escape incompleto en un enlace no impide arrancar la demo', () => {
  for (const hash of ['#/%', '#/producto/%E0%A4%A', '#/%ZZ']) {
    globalThis.location = { hash };
    assert.equal(currentPath(), '/');
  }
});

test('la consulta sigue disponible aunque la ruta del enlace esté dañada', () => {
  globalThis.location = { hash: '#/%?vista=barra' };
  assert.equal(currentPath(), '/');
  assert.equal(currentQuery().get('vista'), 'barra');
});
