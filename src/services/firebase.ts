import { initializeApp, cert } from 'firebase-admin/app';

export const firebase = () => {
  initializeApp({
    credential: cert({
      projectId: 'me-u-ccad4',
      privateKey:
        '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC32hBQrWmHapeK\n1Hr61k/4hSnVDxkykpxKKq29DJAcVnineADKlnVIyeAIhsnAeQ3igF7eAxNlt7G5\n5AiFqYwKt06c6DCz9RWkTNJZFXvREyAjN2fDnXtKvl/v6Rn4gG5Qyp3mRFe7zufp\nkL3NKu9XAXlRDnUZfpmqYRuwMEJkQmBhIFxbmrt/Bhc18wnZThHQB5gq4r58mUrh\nL2lo7INJGDbVtwT4RkIp7iEqSoscS4l0gt1Ss1rQuMG2w9Kz5OQbIxRKDc2KsF3f\nMe5+8462VXz9ZjqEr5zD1gwxVYNz9ftPo31e4gKDneIMxSbIkFnEot4njZKxvyYB\ncXkruRgDAgMBAAECggEANAnfEFblRdUf68XUwWcj354hhxLs+OmSn1ORNa92ou6+\n2/gVkUIhFGc/qGoudPJOwcvADmskdGgYQBuRZfPllaro73SxRF6cr5Km/1wbXcRi\nFlW6Yx4SJcfY89kw5qvDjc6r/t9dTeV0syGq94WtlRzvr8e90WeKKzWtVqNyR1of\niFgOKxz/2wbSv8eGkViHg0EoTiUSqxqOkUT1R9S9o6c+5X8UmbzDKPYnOMJZFpDl\nfnV4OsVMHCTbqvsKb9mtIih/gTJC6Qlk5MVXJUSoBAy4CWtQe2b+nP8otlxzSB4H\nGL+El9+wbT0xmMJlAeqpX1iRgraM13/Ceg95Lf5SEQKBgQDalVfLMOBiPDa4MAJq\nC4KiSiyiYQ42RkUxOS0EXN5ri/1MnOmpfvoKiWbh2nIlOb4q/3bQdY2sgzi+hlgD\nCv5SYxPN968WJ2ROqCdYwuWnZ1ecQlROEj0gqTy6N1YgtO2E2A8Gmz9tBP9Llphf\ngSpJBmgjmxd2qheStLwbYiZe5wKBgQDXUrsXNY8crR66NXcXhnxm4v/sjToQsnYU\n6UreGDMAr7TWq4pJDXgXMxl5rPMeMT48YPfBA0VTwFWz3anPrNGGC8dg5+NkrVi6\nsr8DqUnOyf/kO/LKfOM8Jv6z9417I0MZKi2TgVxq+eQhhDlXE4NjNwpG6Pq2EiJ7\nuxX7CcCmhQKBgDGGfvLh6yU24WsQLavbWcjtp3lPJkoz17+UZdfENv0FJeoy71ph\nE8RJZ48q0IwQrj7NzRzkVapNvRCmHdDqr775Bea4BOqvGDIeNXQODLzGVHpqKPHb\nfhAlaEYE/bXBaMOdtKHZkSBhbnqw72tMN8l98yCGJmXTmi26V5iYv3rnAoGBAKtS\nzzvzSJBniqhcfAqC3h67BSiBYi8A4AVZblFybbphE4Eu8hOYHPJQnTd8DeD7C2rd\nOKQhZxrxUP+RIlj0R63hV11ahEqJxqyeJm/SVcCsZueBb3f/kIo++K/XC4JrlyrB\nrYvNBOy1MfgdDcaj5wmdNJchLsKJgVhzjlS0+M1FAoGBALqTqDVPnfs2M9Rr/89S\n/jy1r16v5KPFWh6+Fq1/YZzkRwiHKZsdqGQPf7OtmbAz0gWeHzhsU5fvtUYALUp3\nrn+924t+Ij1ugrLBaQdFuxI/FS2PyR0OEy28bYzcigb/2ZUDa/OIW8JM3S/8/Pwc\nYM7mZJALk8ZMLnw6oGLxQbMu\n-----END PRIVATE KEY-----\n',
      clientEmail: 'firebase-adminsdk-2n56u@me-u-ccad4.iam.gserviceaccount.com',
    }),
  });
};
