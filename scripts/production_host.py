"""SSH transport for this deployment. Credentials stay in an ignored local file."""
import json
from pathlib import Path
import paramiko

ROOT = Path(__file__).resolve().parent.parent


class ProductionHost:
    def __enter__(self):
        credentials = json.loads((ROOT / ".env.presentation.json").read_text())
        self.client = paramiko.SSHClient()
        self.client.load_system_host_keys()
        self.client.connect(credentials["ssh_host"], username=credentials["ssh_user"],
                            password=credentials["ssh_password"], look_for_keys=False, allow_agent=False, timeout=20)
        return self

    def run(self, command, stdin=None, timeout=240):
        stream, output, error = self.client.exec_command(command, timeout=timeout)
        if stdin is not None:
            stream.write(stdin)
            stream.flush()
            stream.channel.shutdown_write()
        result, errors = output.read().decode(), error.read().decode()
        status = output.channel.recv_exit_status()
        if status:
            raise RuntimeError(f"Remote command failed ({status}): {errors[-1500:]}")
        return result

    def upload(self, source, destination):
        with self.client.open_sftp() as sftp:
            sftp.put(str(source), destination)

    def __exit__(self, *args):
        self.client.close()
