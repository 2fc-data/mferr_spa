import Logo from "../../assets/logoMF.png";

export const Footer = () => {
    return (
        <div>
            <div>
                <img src={Logo} alt="Marcell Ferreira - Advocacia" />
            </div>


            <div>
                <div>
                    (35) 99124-4030
                </div>
                <div>
                    Rua: Prefeito Chagas, 302
                </div>
                <div>
                    Manhattan - Sala 502
                </div>
                <div>
                    Poços de Caldas - MG
                </div>

                {/* <Button> */}
                    Entre em contato
                {/* </Button> */}
            </div>

            <div>
                <div>
                    Áreas de atuação
                </div>
                <div>
                    - Trabalhista
                </div>
            </div>

            <div>
                <div>
                    Nosso escritório
                </div>
                <div>
                    - Sobre nós
                </div>
            </div>

            <div>
                <div>
                    Medias Sociais
                </div>
                <div>
                    Instagram
                </div>
                <div>
                    Twitter
                </div>

            </div>
        </div >
    )
} 
