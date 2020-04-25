import React, { useState } from 'react';
import {
  ColumnContainer,
  Grid,
  OptionCard,
  GridText,
  CardImage,
  SubTitle,
  TextContainer,
  Title,
  GoToNextPage,
} from '../../optionsComponents';
import cardData from '../../assets/productCategory.json';
import Modal from '../../components/Modal';
import ModalContent from './ModalContent';
import { useHistory } from 'react-router-dom';
import IsChecked from '../../components/isChecked';
import { Column } from '../../globalComponents';
import * as NecessityService from '../../services/necessityService';
import { useEffect } from 'react';
import swal from 'sweetalert';
import Loading from 'react-loading';

export default function NeedHelpOptions({ children }) {
  const history = useHistory();
  const isFirstAccess = history.location.state;
  const [showModal, setShowModal] = useState(false);
  const [cardSelectedInfo, setCardSelectedInfo] = useState();
  const [cards, setCards] = useState([]);

  useEffect(() => {
    getCards();
  }, []);

  const getModal = () => {
    return (
      <Modal close={toggleShowModal}>
        <ModalContent
          cardInfo={cardSelectedInfo}
          closeModal={toggleShowModal}
          setCardChecked={setCardChecked}
        ></ModalContent>
      </Modal>
    );
  };

  async function getCards() {
    const userNecessities = await NecessityService.getUserNecessities();
    if (!userNecessities || userNecessities.length === 0) {
      return setCards([...cardData]);
    }
    const dataWithLoading = cardData.map((cat) => {
      const categoryAssist = userNecessities.find(
        (x) => x.category === cat.category,
      );
      return {
        category: cat.category,
        items: categoryAssist && categoryAssist.items,
        imageUrl: cat.imageUrl,
        isChecked: categoryAssist !== undefined,
        isSimple: cat.isSimple,
      };
    });
    setCards(dataWithLoading);
    console.log(dataWithLoading);
  }

  function handleCardClick(card) {
    if (card.isChecked) {
      return handleCheckedCardClick(card);
    }
    if (card.isSimple) {
      return postSimpleNecessity(card.category);
    }
    setCardSelectedInfo(card);
    toggleShowModal();
  }

  function handleCheckedCardClick(card) {
    if (card.isSimple) {
      console.log(card);
      return deleteSimpleCard(card.items[0]._id, card.category);
    }
  }

  async function deleteSimpleCard(id, category) {
    try {
      swal(`Queres apagar a necessidade ${category}`, '', 'info').then(
        async (accepted) => {
          if (accepted) {
            toggleIsCardChecked(category);
            toggleCardLoading(category);
            await NecessityService.deleteSimpleNecessity(id);
            toggleCardLoading(category);
          }
        },
      );
    } catch (error) {
      toggleCardLoading(category);
      toggleIsCardChecked(category);
      swal(`Houve um erro ao apagar a necessidade ${category}`, '', 'info');
    }
  }

  async function postSimpleNecessity(category) {
    try {
      await NecessityService.postNecessity(category);
      setCardChecked(category);
    } catch (error) {}
  }

  const toggleShowModal = () => {
    setShowModal(!showModal);
  };

  const setCardChecked = (categoryName) => {
    const cardIndex = cards.findIndex((x) => x.category === categoryName);
    cards[cardIndex].isChecked = true;
    setCards([...cards]);
  };

  const goToFriends = () => {
    if (isFirstAccess) {
      history.replace('help-or-be-helped');
    } else {
      history.replace('friends');
    }
  };

  const toggleIsCardChecked = (category) => {
    const index = cards.findIndex((x) => x.category === category);
    cards[index].isChecked = !cards[index].isChecked;
    setCards([...cards]);
  };

  const toggleCardLoading = (category) => {
    const index = cards.findIndex((x) => x.category === category);
    cards[index].isLoading = !cards[index].isLoading;
    setCards([...cards]);
  };

  return (
    <ColumnContainer style={{ position: 'relative' }}>
      {children}
      <Column style={{ alignItems: 'center' }}>
        <TextContainer>
          <Title>Preciso de ajuda</Title>
          <SubTitle>
            Pode escolher mais de uma opção, tá?
            <br />É muito importante que você descreva a sua necessidade após a
            seleção da categoria, assim fica mais fácil de ajudar!
          </SubTitle>
        </TextContainer>
        <Grid>
          {cards.map((el) => (
            <OptionCard key={el.category} onClick={() => handleCardClick(el)}>
              <IsChecked
                isChecked={el.isChecked}
                color={'var(--color-pink)'}
              ></IsChecked>
              {el.isLoading && !el.isChecked ? (
                <Loading
                  height='30%'
                  width='30%'
                  type='spinningBubbles'
                  color='var(--color-purple)'
                ></Loading>
              ) : (
                <img
                  src={el.imageUrl}
                  alt={el.category}
                  style={{ maxHeight: '55%' }}
                />
              )}
              <GridText>{el.category}</GridText>
            </OptionCard>
          ))}
          <OptionCard>
            <CardImage src={'./logo.png'} alt={'Outras opçoes'} />
            <GridText>{'Outros'}</GridText>
          </OptionCard>
        </Grid>
        <GoToNextPage>
          <img
            onClick={() => history.push('friends')}
            src='./next.svg'
            style={{ width: '3.5em', cursor: 'pointer' }}
            alt='ver amigos'
          />
        </GoToNextPage>
      </Column>
      {children}
      {showModal && getModal()}
    </ColumnContainer>
  );
}
