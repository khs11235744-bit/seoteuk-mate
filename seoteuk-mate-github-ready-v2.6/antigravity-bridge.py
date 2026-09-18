#!/usr/bin/env python3
# Seoteuk Mate Antigravity DEV Bridge v2.6.0
# Browser -> localhost -> official Google Antigravity CLI (agy)

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import json, os, secrets, shutil, subprocess, sys, platform

HOST = os.environ.get('SEOTEUK_AG_HOST', '127.0.0.1')
PORT = int(os.environ.get('SEOTEUK_AG_PORT', '8765'))
TOKEN_FILE = Path.home() / '.seoteukmate' / 'antigravity_bridge_token.txt'
WORKSPACE = Path.home() / '.seoteukmate' / 'agy-workspace'
TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
WORKSPACE.mkdir(parents=True, exist_ok=True)

if os.environ.get('SEOTEUK_AG_TOKEN'):
    TOKEN = os.environ['SEOTEUK_AG_TOKEN'].strip()
elif TOKEN_FILE.exists():
    TOKEN = TOKEN_FILE.read_text(encoding='utf-8').strip()
else:
    TOKEN = secrets.token_urlsafe(24)
    TOKEN_FILE.write_text(TOKEN, encoding='utf-8')


def _dedupe(paths):
    out, seen = [], set()
    for p in paths:
        if not p:
            continue
        try:
            q = Path(p).expanduser()
            if not q.exists():
                continue
            key = str(q.resolve()).lower() if os.name == 'nt' else str(q.resolve())
            if key not in seen:
                seen.add(key); out.append(q)
        except Exception:
            pass
    return out


def agy_candidates():
    c = []
    override = os.environ.get('SEOTEUK_AGY_PATH')
    if override:
        c.append(Path(override))
    found = shutil.which('agy') or shutil.which('agy.exe')
    if found:
        c.append(Path(found))

    # `where agy` sometimes sees a fresh user PATH that the Python process did not inherit.
    if os.name == 'nt':
        try:
            r = subprocess.run(['where', 'agy'], capture_output=True, text=True, timeout=4, encoding='utf-8', errors='replace')
            if r.returncode == 0:
                for line in r.stdout.splitlines():
                    if line.strip(): c.append(Path(line.strip()))
        except Exception:
            pass

    home = Path.home()
    local = os.environ.get('LOCALAPPDATA')
    pf = os.environ.get('ProgramFiles')
    pf86 = os.environ.get('ProgramFiles(x86)')
    c += [
        Path(local) / 'agy' / 'bin' / 'agy.exe' if local else None,  # official Windows default
        Path(pf) / 'Google' / 'antigravity-cli' / 'agy.exe' if pf else None,
        Path(pf86) / 'Google' / 'antigravity-cli' / 'agy.exe' if pf86 else None,
        home / '.local' / 'bin' / ('agy.exe' if os.name == 'nt' else 'agy'),
    ]
    return _dedupe(c)


def find_agy():
    c = agy_candidates()
    if not c:
        return None
    exe = str(c[0])
    os.environ['PATH'] = str(Path(exe).parent) + os.pathsep + os.environ.get('PATH', '')
    return exe


def run_cmd(args, timeout=30):
    env = os.environ.copy()
    # Avoid an updater lock from interfering with a one-shot bridge request.
    env.setdefault('AGY_CLI_DISABLE_AUTO_UPDATE', 'true')
    kw = dict(
        capture_output=True, text=True, timeout=timeout, cwd=str(WORKSPACE),
        encoding='utf-8', errors='replace', env=env
    )
    if os.name == 'nt':
        kw['creationflags'] = getattr(subprocess, 'CREATE_NO_WINDOW', 0)
    return subprocess.run(args, **kw)


def agy_version():
    exe = find_agy()
    if not exe:
        return None
    try:
        r = run_cmd([exe, '--version'], 10)
        txt = (r.stdout or r.stderr).strip().splitlines()
        return txt[0] if txt else 'installed'
    except Exception as e:
        return f'installed ({type(e).__name__})'


def run_agy(prompt, model='', effort='medium', timeout_seconds=330):
    exe = find_agy()
    if not exe:
        raise RuntimeError(
            'Antigravity CLI(agy)를 찾지 못했습니다. 공식 Windows 기본 경로 '
            r'%LOCALAPPDATA%\agy\bin\agy.exe 와 PATH를 확인했습니다.'
        )
    cmd = [exe, '-p', prompt, '--output-format', 'json', '--print-timeout', '5m']
    if model:
        cmd += ['--model', model]
    if effort in ('low', 'medium', 'high'):
        cmd += ['--effort', effort]
    proc = run_cmd(cmd, timeout_seconds)
    stdout = (proc.stdout or '').strip()
    stderr = (proc.stderr or '').strip()
    data = None
    try:
        data = json.loads(stdout) if stdout else None
    except Exception:
        pass

    if proc.returncode != 0:
        if isinstance(data, dict):
            msg = data.get('error') or data.get('response') or stderr or stdout
        else:
            msg = stderr or stdout
        low = (msg or '').lower()
        if 'authentication required' in low or 'sign in' in low or 'login' in low or 'credential' in low:
            raise RuntimeError('Antigravity 로그인이 필요합니다. 일반 PowerShell에서 agy를 한 번 실행해 Google 계정 로그인을 완료한 뒤 브리지를 다시 실행하세요.')
        if 'keyring' in low or 'credential manager' in low:
            raise RuntimeError('Antigravity 자격증명 저장소(Windows Credential Manager) 접근에 실패했습니다. 브리지를 Antigravity에 로그인한 동일한 Windows 사용자로 실행하세요. 원문: ' + (msg or ''))
        raise RuntimeError(msg or f'agy exited with code {proc.returncode}')

    if not isinstance(data, dict):
        return {'text': stdout, 'usage': None, 'conversation_id': None, 'status': 'SUCCESS'}
    if data.get('status') not in (None, 'SUCCESS'):
        raise RuntimeError(data.get('error') or f"Antigravity status: {data.get('status')}")
    return {
        'text': data.get('response', ''),
        'usage': data.get('usage'),
        'conversation_id': data.get('conversation_id'),
        'duration_seconds': data.get('duration_seconds'),
        'num_turns': data.get('num_turns'),
        'status': data.get('status', 'SUCCESS'),
        'engine': 'antigravity-cli',
        'agy_version': agy_version(),
        'agy_path': exe,
        'model_requested': model or '',
        'model_used': data.get('model') or data.get('model_name') or model or '',
        'effort': effort,
    }


def body_json(handler):
    length = int(handler.headers.get('Content-Length', '0'))
    if length > 8_000_000:
        raise ValueError('요청이 너무 큽니다.')
    raw = handler.rfile.read(length) if length else b'{}'
    try:
        return json.loads(raw or b'{}')
    except Exception:
        raise ValueError('요청 JSON을 읽을 수 없습니다.')


def copy_token_to_clipboard():
    if os.name != 'nt':
        return False
    try:
        subprocess.run(['clip'], input=TOKEN, text=True, timeout=3, check=True)
        return True
    except Exception:
        return False


class ReusableServer(ThreadingHTTPServer):
    allow_reuse_address = True


class Handler(BaseHTTPRequestHandler):
    server_version = 'SeoteukMateAGBridge/2.6.0'

    def log_message(self, fmt, *args):
        print('[bridge]', fmt % args)

    def _cors(self):
        origin = self.headers.get('Origin')
        self.send_header('Access-Control-Allow-Origin', origin or '*')
        if origin:
            self.send_header('Vary', 'Origin')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Seoteuk-Bridge-Token, Access-Control-Request-Private-Network')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
        self.send_header('Access-Control-Max-Age', '600')
        self.send_header('Cross-Origin-Resource-Policy', 'cross-origin')
        self.send_header('Cache-Control', 'no-store, max-age=0')

    def _json(self, status, payload):
        data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self._cors()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _supplied_token(self, body=None):
        supplied = self.headers.get('X-Seoteuk-Bridge-Token', '')
        if not supplied and isinstance(body, dict):
            supplied = str(body.get('token', ''))
        if not supplied:
            q = parse_qs(urlparse(self.path).query)
            supplied = (q.get('token') or [''])[0]
        return supplied

    def _authorized(self, body=None):
        supplied = self._supplied_token(body)
        return bool(supplied) and secrets.compare_digest(supplied, TOKEN)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path.rstrip('/')
        if path == '/health':
            exe = find_agy()
            supplied = self._supplied_token()
            self._json(200, {
                'ok': True,
                'bridge': 'seoteukmate-antigravity-dev',
                'bridge_version': '2.6.0',
                'engine': 'antigravity-cli',
                'agy_found': bool(exe),
                'agy_path': exe,
                'version': agy_version(),
                'platform': platform.platform(),
                'python': sys.version.split()[0],
                'token_required_for_generate': True,
                # backwards compatibility with the old v2.5 browser test
                'token_valid': secrets.compare_digest(supplied, TOKEN) if supplied else None,
            })
            return
        self._json(404, {'ok': False, 'error': 'Not found'})

    def do_POST(self):
        path = urlparse(self.path).path.rstrip('/')
        try:
            body = body_json(self)
        except Exception as e:
            self._json(400, {'ok': False, 'error': str(e)})
            return

        if path == '/v1/ping':
            if not self._authorized(body):
                self._json(401, {'ok': False, 'error': '브리지 토큰이 일치하지 않습니다.'})
                return
            self._json(200, {
                'ok': True,
                'engine': 'antigravity-cli',
                'agy_found': bool(find_agy()),
                'agy_path': find_agy(),
                'version': agy_version(),
            })
            return

        if path != '/v1/generate':
            self._json(404, {'ok': False, 'error': 'Not found'})
            return
        if not self._authorized(body):
            self._json(401, {'ok': False, 'error': '브리지 토큰이 일치하지 않습니다.'})
            return
        try:
            prompt = str(body.get('prompt', '')).strip()
            if not prompt:
                raise ValueError('prompt가 비어 있습니다.')
            model = str(body.get('model', '')).strip()
            effort = str(body.get('effort', 'medium')).strip().lower()
            result = run_agy(prompt, model=model, effort=effort)
            self._json(200, {'ok': True, **result})
        except subprocess.TimeoutExpired:
            self._json(504, {'ok': False, 'error': 'Antigravity 응답 시간이 5분을 초과했습니다.'})
        except Exception as e:
            self._json(500, {'ok': False, 'error': str(e)})


def main():
    exe = find_agy()
    copied = copy_token_to_clipboard()
    print('\n============================================================')
    print(' Seoteuk Mate — Antigravity DEV Bridge v2.6.0')
    print('============================================================')
    print(f' 주소 : http://127.0.0.1:{PORT}')
    print(f' 대체 : http://localhost:{PORT}')
    print(f' 토큰 : {TOKEN}')
    print(f' 복사 : {"클립보드에 토큰 복사됨" if copied else "토큰을 수동 복사하세요"}')
    print(f' agy  : {exe or "NOT FOUND"}')
    print(f' ver  : {agy_version() or "-"}')
    if not exe:
        print('\n[중요] agy를 찾지 못했습니다.')
        print(r'공식 Windows 기본 위치: %LOCALAPPDATA%\agy\bin\agy.exe')
        print('설치(PowerShell): irm https://antigravity.google/cli/install.ps1 | iex')
        print('설치 후 새 PowerShell을 열고 agy를 1회 실행하세요.')
    else:
        print('\n[로그인 확인] 같은 Windows 사용자로 일반 PowerShell에서 agy를 1회 실행해 로그인해 두세요.')
    print('\n웹앱: ⚡ Antigravity DEV → 토큰 붙여넣기 → 연결 테스트 → 문장 생성 테스트')
    print('HTTPS 웹앱에서는 Chrome/Edge가 로컬 네트워크 접근 권한을 물을 수 있습니다. 반드시 허용하세요.')
    print('종료: Ctrl+C')
    print('============================================================\n')
    try:
        server = ReusableServer((HOST, PORT), Handler)
        server.serve_forever()
    except OSError as e:
        print(f'[실행 실패] 포트 {PORT}를 열 수 없습니다: {e}')
        print('이미 브리지가 실행 중인지 확인하거나 SEOTEUK_AG_PORT를 바꾸세요.')
        if sys.stdin.isatty(): input('Enter를 누르면 종료합니다...')
    except KeyboardInterrupt:
        pass

if __name__ == '__main__':
    main()
