-- CreateTable
CREATE TABLE "usuario" (
    "ID_usuario" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "senha" VARCHAR(64) NOT NULL,
    "data_nascimento" DATE,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("ID_usuario")
);

-- CreateTable
CREATE TABLE "administrador" (
    "ID_adm" SERIAL NOT NULL,
    "ID_usuario_adm" INTEGER NOT NULL,

    CONSTRAINT "administrador_pkey" PRIMARY KEY ("ID_adm")
);

-- CreateTable
CREATE TABLE "cliente" (
    "ID_cliente" SERIAL NOT NULL,
    "ID_usuario_cliente" INTEGER NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("ID_cliente")
);

-- CreateTable
CREATE TABLE "jogos" (
    "ID_jogo" SERIAL NOT NULL,
    "titulo" VARCHAR(30) NOT NULL,
    "descricao" VARCHAR(300),

    CONSTRAINT "jogos_pkey" PRIMARY KEY ("ID_jogo")
);

-- CreateTable
CREATE TABLE "categoria" (
    "ID_categoria" SERIAL NOT NULL,
    "categoria" VARCHAR(20) NOT NULL,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("ID_categoria")
);

-- CreateTable
CREATE TABLE "jogos_categoria" (
    "ID_jogos_categoria" SERIAL NOT NULL,
    "ID_jogo" INTEGER NOT NULL,
    "ID_categoria" INTEGER NOT NULL,

    CONSTRAINT "jogos_categoria_pkey" PRIMARY KEY ("ID_jogos_categoria")
);

-- CreateTable
CREATE TABLE "jogos_zerados" (
    "ID_jogos_zerados" SERIAL NOT NULL,
    "ID_cliente" INTEGER NOT NULL,
    "ID_jogo" INTEGER NOT NULL,
    "data_conclusao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jogos_zerados_pkey" PRIMARY KEY ("ID_jogos_zerados")
);

-- CreateTable
CREATE TABLE "conquista" (
    "ID_conquista" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" VARCHAR(300) NOT NULL,

    CONSTRAINT "conquista_pkey" PRIMARY KEY ("ID_conquista")
);

-- CreateTable
CREATE TABLE "conquista_cliente" (
    "ID_conquista_cliente" SERIAL NOT NULL,
    "ID_cliente" INTEGER NOT NULL,
    "ID_conquista" INTEGER NOT NULL,
    "data_conquista" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conquista_cliente_pkey" PRIMARY KEY ("ID_conquista_cliente")
);

-- CreateTable
CREATE TABLE "rank_semanal" (
    "ID_rank" SERIAL NOT NULL,
    "data" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rank_semanal_pkey" PRIMARY KEY ("ID_rank")
);

-- CreateTable
CREATE TABLE "rank_cliente" (
    "ID_rank_cliente" SERIAL NOT NULL,
    "ID_rank" INTEGER NOT NULL,
    "ID_cliente" INTEGER NOT NULL,
    "pontuacao_rank" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "rank_cliente_pkey" PRIMARY KEY ("ID_rank_cliente")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "administrador_ID_usuario_adm_key" ON "administrador"("ID_usuario_adm");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_ID_usuario_cliente_key" ON "cliente"("ID_usuario_cliente");

-- CreateIndex
CREATE UNIQUE INDEX "categoria_categoria_key" ON "categoria"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "jogos_categoria_ID_jogo_ID_categoria_key" ON "jogos_categoria"("ID_jogo", "ID_categoria");

-- CreateIndex
CREATE UNIQUE INDEX "jogos_zerados_ID_cliente_ID_jogo_key" ON "jogos_zerados"("ID_cliente", "ID_jogo");

-- CreateIndex
CREATE UNIQUE INDEX "conquista_cliente_ID_cliente_ID_conquista_key" ON "conquista_cliente"("ID_cliente", "ID_conquista");

-- CreateIndex
CREATE UNIQUE INDEX "rank_cliente_ID_rank_ID_cliente_key" ON "rank_cliente"("ID_rank", "ID_cliente");

-- AddForeignKey
ALTER TABLE "administrador" ADD CONSTRAINT "administrador_ID_usuario_adm_fkey" FOREIGN KEY ("ID_usuario_adm") REFERENCES "usuario"("ID_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_ID_usuario_cliente_fkey" FOREIGN KEY ("ID_usuario_cliente") REFERENCES "usuario"("ID_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos_categoria" ADD CONSTRAINT "jogos_categoria_ID_jogo_fkey" FOREIGN KEY ("ID_jogo") REFERENCES "jogos"("ID_jogo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos_categoria" ADD CONSTRAINT "jogos_categoria_ID_categoria_fkey" FOREIGN KEY ("ID_categoria") REFERENCES "categoria"("ID_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos_zerados" ADD CONSTRAINT "jogos_zerados_ID_cliente_fkey" FOREIGN KEY ("ID_cliente") REFERENCES "cliente"("ID_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos_zerados" ADD CONSTRAINT "jogos_zerados_ID_jogo_fkey" FOREIGN KEY ("ID_jogo") REFERENCES "jogos"("ID_jogo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conquista_cliente" ADD CONSTRAINT "conquista_cliente_ID_cliente_fkey" FOREIGN KEY ("ID_cliente") REFERENCES "cliente"("ID_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conquista_cliente" ADD CONSTRAINT "conquista_cliente_ID_conquista_fkey" FOREIGN KEY ("ID_conquista") REFERENCES "conquista"("ID_conquista") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank_cliente" ADD CONSTRAINT "rank_cliente_ID_rank_fkey" FOREIGN KEY ("ID_rank") REFERENCES "rank_semanal"("ID_rank") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank_cliente" ADD CONSTRAINT "rank_cliente_ID_cliente_fkey" FOREIGN KEY ("ID_cliente") REFERENCES "cliente"("ID_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;
